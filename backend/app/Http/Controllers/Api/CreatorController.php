<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\CampaignApplication;
use App\Models\Deliverable;
use App\Models\Media;
use App\Models\SettlementRequest;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CreatorController extends Controller
{
    public function __construct(
        private NotificationService $notificationService
    ) {}

    public function dashboard()
    {
        $user = auth()->user();
        $userId = $user->id;

        $totalEarnings = DB::table('payments')
            ->join('campaign_applications', function ($join) use ($userId) {
                $join->on('payments.campaign_id', '=', 'campaign_applications.campaign_id')
                    ->where('campaign_applications.creator_id', '=', $userId)
                    ->where('campaign_applications.status', '=', 'completed');
            })
            ->where('payments.creator_id', $userId)
            ->where('payments.status', 'released')
            ->sum('payments.amount');

        return response()->json([
            'active_applications' => $user->applications()->whereIn('status', ['pending', 'accepted'])->count(),
            'completed_campaigns' => $user->applications()->where('status', 'completed')->count(),
            'total_earnings' => $totalEarnings,
            'pending_payments' => $user->wallet?->pending_balance ?? 0,
            'available_balance' => $user->wallet?->balance ?? 0,
            'recent_applications' => $user->applications()
                ->with('campaign')
                ->latest()
                ->take(5)
                ->get(),
        ]);
    }

    public function availableCampaigns()
    {
        $user = auth()->user();
        $appliedIds = $user->applications()->pluck('campaign_id');

        return Campaign::where('status', 'open')
            ->whereNotIn('id', $appliedIds)
            ->when($user->gender, function ($q) {
                $q->where(function ($q) use ($user) {
                    $q->whereNull('target_gender')
                        ->orWhere('target_gender', 'any')
                        ->orWhere('target_gender', $user->gender);
                });
            })
            ->when($user->date_of_birth, function ($q) use ($user) {
                $age = now()->diffInYears($user->date_of_birth);
                $q->where(function ($q) use ($age) {
                    $q->whereNull('target_age_min')
                        ->orWhere('target_age_min', '<=', $age);
                })->where(function ($q) use ($age) {
                    $q->whereNull('target_age_max')
                        ->orWhere('target_age_max', '>=', $age);
                });
            })
            ->with('advertiser')
            ->latest()
            ->paginate(12);
    }

    public function apply(Request $request, Campaign $campaign)
    {
        if ($campaign->status !== 'open') {
            return response()->json(['message' => 'Campaign is not open for applications'], 422);
        }

        $exists = CampaignApplication::where('campaign_id', $campaign->id)
            ->where('creator_id', auth()->id())
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Already applied to this campaign'], 422);
        }

        $validated = $request->validate([
            'proposal' => ['required', 'string', 'max:5000'],
            'proposed_rate' => ['required', 'numeric', 'min:0', 'max:'.$campaign->budget],
        ]);

        $application = CampaignApplication::create([
            'campaign_id' => $campaign->id,
            'creator_id' => auth()->id(),
            'proposal' => $validated['proposal'],
            'proposed_rate' => $validated['proposed_rate'],
        ]);

        try {
            $this->notificationService->notifyNewApplication(
                $campaign->advertiser,
                auth()->user(),
                $campaign
            );
        } catch (\Exception $e) {
        }

        return response()->json($application->load('campaign'), 201);
    }

    public function myApplications()
    {
        return auth()->user()->applications()
            ->with(['campaign', 'deliverables'])
            ->latest()
            ->paginate(12);
    }

    public function myApplication(CampaignApplication $application)
    {
        if ($application->creator_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json(
            $application->load([
                'campaign.advertiser',
                'deliverables' => fn ($q) => $q->latest(),
            ])
        );
    }

    public function submitDeliverable(Request $request, CampaignApplication $application)
    {
        if ($application->creator_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($application->status !== 'accepted' && $application->status !== 'revision_requested') {
            return response()->json(['message' => 'Application must be accepted first'], 422);
        }

        $validated = $request->validate([
            'content_url' => ['nullable', 'string', 'max:2048'],
            'content_type' => ['required', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:5000'],
            'media_id' => ['nullable', 'exists:media,id'],
            'file' => ['nullable', 'file', 'max:102400', 'mimes:jpg,jpeg,png,webp,gif,mp4,mov,avi,webm,pdf'],
        ]);

        $contentUrl = $validated['content_url'] ?? null;

        // Direct file upload (faster one-step)
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->store("uploads/deliverable/{$application->id}", 'public');
            $media = Media::create([
                'user_id' => auth()->id(),
                'file_path' => $path,
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
                'collection' => 'deliverable',
                'model_type' => Deliverable::class,
            ]);
            $contentUrl = $media->url;
        }

        if ($validated['media_id'] ?? null) {
            $media = Media::find($validated['media_id']);
            $contentUrl = $media->url;
            $media->update([
                'model_type' => Deliverable::class,
            ]);
        }

        $deliverable = Deliverable::create([
            'application_id' => $application->id,
            'content_url' => $contentUrl,
            'content_type' => $validated['content_type'],
            'notes' => $validated['notes'],
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        if ($validated['media_id'] ?? null) {
            Media::where('id', $validated['media_id'])->update(['model_id' => $deliverable->id]);
        }

        $application->update(['status' => $application->status === 'revision_requested' ? 'in_revision' : 'completed']);

        // Notify advertiser
        try {
            $campaign = $application->campaign;
            $advertiser = $campaign->advertiser;
            $creator = auth()->user();
            $this->notificationService->send(
                $advertiser,
                'new_deliverable',
                [
                    'message' => "قام {$creator->name} بتسليم المحتوى للحملة: {$campaign->title}",
                    'campaign_id' => $campaign->id,
                    'application_id' => $application->id,
                ]
            );
        } catch (\Exception $e) {
        }

        return response()->json($deliverable->load('application.campaign'), 201);
    }

    public function markReceived(CampaignApplication $application)
    {
        if ($application->creator_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($application->shipping_status !== 'shipped') {
            return response()->json(['message' => 'Item has not been shipped yet'], 422);
        }

        $application->update([
            'shipping_status' => 'received',
            'received_at' => now(),
        ]);

        try {
            $this->notificationService->notifyItemReceived(
                $application->campaign->advertiser,
                $application->campaign,
                $application
            );
        } catch (\Exception $e) {
        }

        return response()->json($application->fresh());
    }

    public function settlementRequests()
    {
        return auth()->user()->settlementRequests()->latest()->paginate(12);
    }

    public function requestSettlement(Request $request)
    {
        $user = auth()->user();
        $wallet = $user->wallet;

        if (! $wallet || $wallet->pending_balance <= 0) {
            return response()->json(['message' => 'No pending balance to settle'], 422);
        }

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:1', 'max:'.$wallet->pending_balance],
        ]);

        $settlementRequest = SettlementRequest::create([
            'user_id' => $user->id,
            'amount' => $validated['amount'],
            'status' => 'pending',
        ]);

        // Notify all admins
        try {
            $admins = User::where('role', 'admin')->where('is_active', true)->get();
            foreach ($admins as $admin) {
                $this->notificationService->notifyNewSettlementRequest(
                    $admin,
                    $user,
                    $validated['amount']
                );
            }
        } catch (\Exception $e) {
        }

        return response()->json($settlementRequest, 201);
    }

    public function earnings()
    {
        $wallet = auth()->user()->wallet;

        return response()->json([
            'balance' => $wallet?->balance ?? 0,
            'pending' => $wallet?->pending_balance ?? 0,
            'transactions' => $wallet?->transactions()->latest()->paginate(12) ?? [],
        ]);
    }

    public function updateProfile(Request $request)
    {
        $profile = auth()->user()->creatorProfile;

        $validated = $request->validate([
            'category' => ['sometimes', 'string', 'max:255'],
            'platforms' => ['sometimes', 'array'],
            'platforms.*' => ['string'],
            'rates' => ['sometimes', 'array'],
            'portfolio_links' => ['sometimes', 'array'],
            'portfolio_links.*' => ['url'],
            'followers_count' => ['sometimes', 'integer', 'min:0'],
            'engagement_rate' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'address' => ['sometimes', 'string', 'max:500'],
            'city' => ['sometimes', 'string', 'max:100'],
            'state' => ['sometimes', 'string', 'max:100'],
            'zip_code' => ['sometimes', 'string', 'max:20'],
            'country' => ['sometimes', 'string', 'max:2'],
        ]);

        $profile->update($validated);

        return response()->json($profile);
    }

    public function payoutMethods()
    {
        $profile = auth()->user()->creatorProfile;

        return response()->json([
            'payment_method' => $profile->payment_method,
            'payment_phone' => $profile->payment_phone,
            'payment_name' => $profile->payment_name,
        ]);
    }

    public function updatePayoutMethods(Request $request)
    {
        $profile = auth()->user()->creatorProfile;

        $validated = $request->validate([
            'payment_method' => ['required', 'string', 'in:zain_cash,super_kay,fib,bank_transfer'],
            'payment_phone' => ['required', 'string', 'max:50'],
            'payment_name' => ['required', 'string', 'max:255'],
        ]);

        $profile->update($validated);

        return response()->json([
            'message' => 'تم حفظ بيانات الدفع بنجاح',
            'payment_method' => $profile->payment_method,
            'payment_phone' => $profile->payment_phone,
            'payment_name' => $profile->payment_name,
        ]);
    }

    public function discoverCreators(Request $request)
    {
        $validated = $request->validate([
            'category' => ['nullable', 'string'],
            'min_followers' => ['nullable', 'integer', 'min:0'],
            'search' => ['nullable', 'string', 'max:255'],
            'gender' => ['nullable', 'string', 'in:male,female'],
            'age_min' => ['nullable', 'integer', 'min:13', 'max:100'],
            'age_max' => ['nullable', 'integer', 'min:13', 'max:100'],
        ]);

        $query = User::where('role', 'creator')->where('is_active', true)
            ->with('creatorProfile');

        if (! empty($validated['category'])) {
            $query->whereHas('creatorProfile', fn ($q) => $q->where('category', $validated['category']));
        }

        if (! empty($validated['min_followers'])) {
            $query->whereHas('creatorProfile', fn ($q) => $q->where('followers_count', '>=', $validated['min_followers']));
        }

        if (! empty($validated['search'])) {
            $query->where('name', 'like', '%'.$validated['search'].'%');
        }

        if (! empty($validated['gender'])) {
            $query->where('gender', $validated['gender']);
        }

        if (! empty($validated['age_min'])) {
            $query->whereDate('date_of_birth', '<=', now()->subYears($validated['age_min'])->toDateString());
        }

        if (! empty($validated['age_max'])) {
            $query->whereDate('date_of_birth', '>=', now()->subYears($validated['age_max'] + 1)->toDateString());
        }

        return $query->paginate(20);
    }
}
