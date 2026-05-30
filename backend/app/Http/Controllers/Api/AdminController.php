<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DepositRequestResource;
use App\Models\AdminLog;
use App\Models\Campaign;
use App\Models\CreatorProfile;
use App\Models\DepositRequest;
use App\Models\Payment;
use App\Models\SettlementRequest;
use App\Models\User;
use App\Models\Wallet;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function __construct(
        private NotificationService $notificationService
    ) {}

    public function dashboard()
    {
        return response()->json([
            'total_users' => User::count(),
            'total_creators' => User::where('role', 'creator')->count(),
            'total_advertisers' => User::where('role', 'advertiser')->count(),
            'total_campaigns' => Campaign::count(),
            'active_campaigns' => Campaign::whereIn('status', ['active', 'open'])->count(),
            'total_payments_held' => Payment::where('status', 'held')->sum('amount'),
            'total_payments_released' => Payment::where('status', 'released')->sum('amount'),
            'platform_revenue' => Payment::where('status', 'released')->sum('platform_fee'),
            'recent_users' => User::latest()->take(10)->get(),
            'recent_campaigns' => Campaign::with('advertiser')->latest()->take(10)->get(),
        ]);
    }

    public function users(Request $request)
    {
        $query = User::query();

        if ($request->role) {
            $query->where('role', $request->role);
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        if ($request->kyc_status) {
            $query->where('kyc_status', $request->kyc_status);
        }

        return $query->with(['creatorProfile', 'advertiserProfile'])
            ->latest()
            ->paginate(20);
    }

    public function updateUser(Request $request, User $user)
    {
        $validated = $request->validate([
            'is_active' => ['sometimes', 'boolean'],
            'kyc_status' => ['sometimes', 'string', 'in:pending,verified,rejected,not_submitted'],
            'role' => ['sometimes', 'string', 'in:admin,creator,advertiser'],
        ]);

        $user->update($validated);

        AdminLog::create([
            'admin_id' => auth()->id(),
            'action' => 'update_user',
            'target_type' => 'user',
            'target_id' => $user->id,
            'metadata' => $validated,
        ]);

        return response()->json($user->fresh());
    }

    public function campaigns(Request $request)
    {
        $query = Campaign::with('advertiser');

        if ($request->status) {
            $query->where('status', $request->status);
        }

        return $query->withCount('applications')->latest()->paginate(20);
    }

    public function updateCampaignStatus(Request $request, Campaign $campaign)
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:draft,open,in_review,active,completed,cancelled'],
        ]);

        $campaign->update($validated);

        AdminLog::create([
            'admin_id' => auth()->id(),
            'action' => 'update_campaign_status',
            'target_type' => 'campaign',
            'target_id' => $campaign->id,
            'metadata' => $validated,
        ]);

        return response()->json($campaign->fresh());
    }

    public function payments(Request $request)
    {
        $query = Payment::with(['campaign', 'advertiser', 'creator']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        return $query->latest()->paginate(20);
    }

    public function releasePayment(Payment $payment)
    {
        if ($payment->status !== 'held') {
            return response()->json(['message' => 'Payment is not in held status'], 422);
        }

        DB::transaction(function () use ($payment) {
            // Re-lock payment row to prevent double-release
            $lockedPayment = Payment::where('id', $payment->id)->lockForUpdate()->first();

            $lockedPayment->update([
                'status' => 'released',
                'released_at' => now(),
            ]);

            $wallet = $payment->creator->wallet;
            if ($wallet) {
                $lockedWallet = Wallet::where('id', $wallet->id)->lockForUpdate()->first();
                $netAmount = $lockedPayment->amount - $lockedPayment->platform_fee;
                $lockedWallet->increment('balance', $netAmount);
                $lockedWallet->transactions()->create([
                    'amount' => $netAmount,
                    'type' => 'payment',
                    'description' => "Payment released for campaign #{$lockedPayment->campaign_id}",
                    'reference_type' => 'payment',
                    'reference_id' => $lockedPayment->id,
                    'status' => 'completed',
                ]);
            }

            AdminLog::create([
                'admin_id' => auth()->id(),
                'action' => 'release_payment',
                'target_type' => 'payment',
                'target_id' => $lockedPayment->id,
            ]);
        });

        try {
            $this->notificationService->notifyPaymentReleased(
                $payment->creator,
                $payment->campaign,
                $payment->amount - $payment->platform_fee
            );
        } catch (\Exception $e) {
        }

        return response()->json($payment->fresh());
    }

    public function refundPayment(Payment $payment)
    {
        if ($payment->status !== 'held') {
            return response()->json(['message' => 'Payment is not in held status'], 422);
        }

        DB::transaction(function () use ($payment) {
            $lockedPayment = Payment::where('id', $payment->id)->lockForUpdate()->first();
            $lockedPayment->update(['status' => 'refunded']);

            $wallet = $payment->advertiser->wallet;
            if ($wallet) {
                $lockedWallet = Wallet::where('id', $wallet->id)->lockForUpdate()->first();
                $lockedWallet->increment('balance', $lockedPayment->amount);
                $lockedWallet->transactions()->create([
                    'amount' => $lockedPayment->amount,
                    'type' => 'refund',
                    'description' => "Refund for campaign #{$lockedPayment->campaign_id}",
                    'reference_type' => 'payment',
                    'reference_id' => $lockedPayment->id,
                    'status' => 'completed',
                ]);
            }
        });

        return response()->json($payment->fresh());
    }

    public function logs()
    {
        return AdminLog::with('admin')->latest()->paginate(50);
    }

    public function settlementRequests(Request $request)
    {
        $query = SettlementRequest::with('user.creatorProfile');

        if ($request->status) {
            $query->where('status', $request->status);
        }

        return $query->latest()->paginate(20);
    }

    public function processSettlement(Request $request, SettlementRequest $settlementRequest)
    {
        if ($settlementRequest->status !== 'pending') {
            return response()->json(['message' => 'Settlement request already processed'], 422);
        }

        $validated = $request->validate([
            'action' => ['required', 'string', 'in:approve,reject'],
            'admin_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $newStatus = $validated['action'] === 'approve' ? 'approved' : 'rejected';

        $settlementRequest->update([
            'status' => $newStatus,
            'admin_notes' => $validated['admin_notes'] ?? null,
            'processed_at' => now(),
        ]);

        if ($validated['action'] === 'approve') {
            // Deduct from user wallet
            DB::transaction(function () use ($settlementRequest) {
                $wallet = $settlementRequest->user->wallet;
                if ($wallet) {
                    $lockedWallet = Wallet::where('id', $wallet->id)->lockForUpdate()->first();

                    if ($lockedWallet->balance < $settlementRequest->amount) {
                        throw new \Exception('Insufficient wallet balance');
                    }

                    $lockedWallet->decrement('balance', $settlementRequest->amount);

                    $lockedWallet->transactions()->create([
                        'amount' => -$settlementRequest->amount,
                        'type' => 'settlement',
                        'description' => 'سحب أرباح إلى المحفظة الخارجية',
                        'reference_type' => 'settlement_request',
                        'reference_id' => $settlementRequest->id,
                        'status' => 'completed',
                    ]);

                    AdminLog::create([
                        'admin_id' => auth()->id(),
                        'action' => 'process_settlement',
                        'target_type' => 'settlement_request',
                        'target_id' => $settlementRequest->id,
                        'metadata' => ['amount' => $settlementRequest->amount],
                    ]);
                }
            });
        }

        try {
            $this->notificationService->notifySettlementProcessed(
                $settlementRequest->user,
                $settlementRequest,
                $newStatus
            );
        } catch (\Exception $e) {
        }

        return response()->json($settlementRequest->fresh());
    }

    public function analytics()
    {
        // ── Summary counts ──
        $summary = [
            'total_users' => User::count(),
            'total_creators' => User::where('role', 'creator')->count(),
            'total_advertisers' => User::where('role', 'advertiser')->count(),
            'total_campaigns' => Campaign::count(),
            'active_campaigns' => Campaign::whereIn('status', ['active', 'open'])->count(),
            'platform_revenue' => Payment::where('status', 'released')->sum('platform_fee'),
            'payments_held' => Payment::where('status', 'held')->sum('amount'),
            'payments_released' => Payment::where('status', 'released')->sum('amount'),
            'pending_kyc' => User::where('kyc_status', 'pending')->count(),
            'total_wallet_balance' => Wallet::sum('balance'),
            'total_wallet_pending' => Wallet::sum('pending_balance'),
            'pending_deposits' => DepositRequest::where('status', 'pending')->count(),
            'pending_settlements' => SettlementRequest::where('status', 'pending')->count(),
        ];

        // ── Gender distribution by role ──
        $genderStats = User::whereNotNull('gender')
            ->selectRaw('gender, role, COUNT(*) as count')
            ->groupBy('gender', 'role')
            ->get();

        // ── Age distribution ──
        $now = now()->toDateString();
        $ageRanges = [
            'under_18' => ['min' => 0, 'max' => 17],
            '18_24' => ['min' => 18, 'max' => 24],
            '25_34' => ['min' => 25, 'max' => 34],
            '35_44' => ['min' => 35, 'max' => 44],
            '45_plus' => ['min' => 45, 'max' => 120],
        ];
        $ageStats = [];
        foreach ($ageRanges as $label => $range) {
            $count = User::whereNotNull('date_of_birth')
                ->whereRaw('TIMESTAMPDIFF(YEAR, date_of_birth, ?) >= ?', [$now, $range['min']])
                ->whereRaw('TIMESTAMPDIFF(YEAR, date_of_birth, ?) <= ?', [$now, $range['max']])
                ->count();
            $ageStats[$label] = $count;
        }

        // ── Campaign demographics ──
        $campaignDemographics = [
            'target_gender' => Campaign::whereNotNull('target_gender')
                ->selectRaw('target_gender, COUNT(*) as count')
                ->groupBy('target_gender')
                ->pluck('count', 'target_gender'),
            'avg_age_min' => Campaign::whereNotNull('target_age_min')->avg('target_age_min'),
            'avg_age_max' => Campaign::whereNotNull('target_age_max')->avg('target_age_max'),
            'total_with_targeting' => Campaign::whereNotNull('target_gender')
                ->orWhereNotNull('target_age_min')
                ->orWhereNotNull('target_age_max')
                ->count(),
            'avg_videos_per_creator' => Campaign::avg('videos_per_creator'),
        ];

        // ── Creator category distribution ──
        $categoryStats = CreatorProfile::whereNotNull('category')
            ->selectRaw('category, COUNT(*) as count')
            ->groupBy('category')
            ->orderByDesc('count')
            ->get();

        // ── Monthly registrations (last 12 months) ──
        $monthlyRegistrations = User::selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count")
            ->where('created_at', '>=', now()->subMonths(12))
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('count', 'month');

        // ── Monthly campaigns created ──
        $monthlyCampaigns = Campaign::selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count")
            ->where('created_at', '>=', now()->subMonths(12))
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('count', 'month');

        // ── Monthly revenue (last 12 months) ──
        $monthlyRevenue = Payment::where('status', 'released')
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, SUM(platform_fee) as total")
            ->where('created_at', '>=', now()->subMonths(12))
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('total', 'month');

        // ── Campaign status breakdown ──
        $campaignStatusStats = Campaign::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->orderByDesc('count')
            ->get();

        // ── Recent users (last 10) ──
        $recentUsers = User::latest()->take(10)->get();

        // ── Recent campaigns ──
        $recentCampaigns = Campaign::with('advertiser')->latest()->take(10)->get();

        return response()->json([
            'summary' => $summary,
            'gender_distribution' => $genderStats,
            'age_distribution' => $ageStats,
            'campaign_demographics' => $campaignDemographics,
            'category_distribution' => $categoryStats,
            'monthly_registrations' => $monthlyRegistrations,
            'monthly_campaigns' => $monthlyCampaigns,
            'monthly_revenue' => $monthlyRevenue,
            'campaign_status_stats' => $campaignStatusStats,
            'recent_users' => $recentUsers,
            'recent_campaigns' => $recentCampaigns,
        ]);
    }

    // Deposit request management
    public function depositRequests(Request $request)
    {
        $query = DepositRequest::with('user');

        if ($request->status) {
            $query->where('status', $request->status);
        }

        return DepositRequestResource::collection(
            $query->latest()->paginate(20)
        );
    }

    public function reviewDeposit(Request $request, DepositRequest $depositRequest)
    {
        if ($depositRequest->status !== 'pending') {
            return response()->json(['message' => 'تمت معالجة طلب الإيداع بالفعل'], 422);
        }

        $validated = $request->validate([
            'action' => ['required', 'string', 'in:approve,reject'],
            'admin_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $newStatus = $validated['action'] === 'approve' ? 'approved' : 'rejected';

        $depositRequest->update([
            'status' => $newStatus,
            'admin_notes' => $validated['admin_notes'] ?? null,
            'processed_at' => now(),
        ]);

        if ($validated['action'] === 'approve') {
            DB::transaction(function () use ($depositRequest) {
                $wallet = $depositRequest->user->wallet;
                if ($wallet) {
                    $lockedWallet = Wallet::where('id', $wallet->id)->lockForUpdate()->first();
                    $lockedWallet->increment('balance', $depositRequest->amount);

                    $lockedWallet->transactions()->create([
                        'amount' => $depositRequest->amount,
                        'type' => 'deposit',
                        'description' => 'إيداع عبر تحميل إيصال',
                        'reference_type' => 'deposit_request',
                        'reference_id' => $depositRequest->id,
                        'status' => 'completed',
                    ]);
                }
            });
        }

        AdminLog::create([
            'admin_id' => auth()->id(),
            'action' => $validated['action'] === 'approve' ? 'approve_deposit' : 'reject_deposit',
            'target_type' => 'deposit_request',
            'target_id' => $depositRequest->id,
            'metadata' => ['amount' => $depositRequest->amount],
        ]);

        try {
            $this->notificationService->send(
                $depositRequest->user,
                'deposit_'.$newStatus,
                [
                    'message' => $validated['action'] === 'approve'
                        ? "تم قبول طلب الإيداع بمبلغ {$depositRequest->amount} دولار وتم إضافة الرصيد إلى محفظتك"
                        : "تم رفض طلب الإيداع بمبلغ {$depositRequest->amount} دولار".($validated['admin_notes'] ? "، السبب: {$validated['admin_notes']}" : ''),
                    'amount' => $depositRequest->amount,
                ]
            );
        } catch (\Exception $e) {
        }

        return response()->json(new DepositRequestResource($depositRequest->fresh()));
    }
}
