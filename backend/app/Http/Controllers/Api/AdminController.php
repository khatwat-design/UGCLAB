<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\Campaign;
use App\Models\Payment;
use App\Models\AdminLog;
use App\Models\CampaignApplication;
use App\Models\SettlementRequest;
use App\Enums\UserRole;
use App\Enums\CampaignStatus;
use App\Enums\PaymentStatus;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
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
                $lockedWallet = \App\Models\Wallet::where('id', $wallet->id)->lockForUpdate()->first();
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
        } catch (\Exception $e) {}

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
                $lockedWallet = \App\Models\Wallet::where('id', $wallet->id)->lockForUpdate()->first();
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
        $query = SettlementRequest::with('user');

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
            // Release all held payments for this user up to the requested amount
            $remaining = $settlementRequest->amount;
            $payments = Payment::where('creator_id', $settlementRequest->user_id)
                ->where('status', 'held')
                ->orderBy('created_at')
                ->get();

            DB::transaction(function () use ($payments, $remaining, $settlementRequest) {
                foreach ($payments as $payment) {
                    if ($remaining <= 0) break;

                    $lockedPayment = Payment::where('id', $payment->id)->lockForUpdate()->first();
                    $netAmount = $lockedPayment->amount - $lockedPayment->platform_fee;

                    $lockedPayment->update([
                        'status' => 'released',
                        'released_at' => now(),
                    ]);

                    $wallet = $lockedPayment->creator->wallet;
                    if ($wallet) {
                        $lockedWallet = \App\Models\Wallet::where('id', $wallet->id)->lockForUpdate()->first();
                        $lockedWallet->increment('balance', $netAmount);
                        $lockedWallet->transactions()->create([
                            'amount' => $netAmount,
                            'type' => 'payment',
                            'description' => "Settlement release for campaign #{$lockedPayment->campaign_id}",
                            'reference_type' => 'settlement_request',
                            'reference_id' => $settlementRequest->id,
                            'status' => 'completed',
                        ]);
                    }

                    $remaining -= $lockedPayment->amount;

                    AdminLog::create([
                        'admin_id' => auth()->id(),
                        'action' => 'release_payment',
                        'target_type' => 'payment',
                        'target_id' => $lockedPayment->id,
                        'metadata' => ['settlement_request_id' => $settlementRequest->id],
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
        } catch (\Exception $e) {}

        return response()->json($settlementRequest->fresh());
    }
}
