<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\Campaign;
use App\Models\CampaignApplication;
use App\Models\Deliverable;
use App\Models\Notification;
use App\Models\Payment;
use App\Models\Wallet;
use App\Enums\ApplicationStatus;
use App\Enums\CampaignStatus;
use App\Enums\PaymentStatus;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class AdvertiserController extends Controller
{
    public function __construct(
        private NotificationService $notificationService
    ) {}
    public function dashboard()
    {
        $user = auth()->user();

        return response()->json([
            'active_campaigns' => $user->campaigns()->whereIn('status', ['active', 'open'])->count(),
            'completed_campaigns' => $user->campaigns()->where('status', 'completed')->count(),
            'total_spent' => Payment::where('advertiser_id', $user->id)
                ->where('status', 'released')
                ->sum('amount'),
            'pending_applications' => CampaignApplication::whereHas('campaign', fn($q) => $q->where('advertiser_id', $user->id))
                ->where('status', 'pending')
                ->count(),
            'recent_campaigns' => $user->campaigns()->withCount('applications')->latest()->take(5)->get(),
        ]);
    }

    public function index()
    {
        return auth()->user()->campaigns()
            ->withCount('applications')
            ->latest()
            ->paginate(12);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:5000'],
            'brief' => ['nullable', 'string', 'max:10000'],
            'budget' => ['required', 'numeric', 'min:1'],
            'category' => ['nullable', 'string', 'max:255'],
            'requirements' => ['nullable', 'array'],
            'start_date' => ['nullable', 'date', 'after_or_equal:today'],
            'end_date' => ['nullable', 'date', 'after:start_date'],
            'max_creators' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $data = array_merge($validated, ['status' => 'open']);
        $campaign = auth()->user()->campaigns()->create($data);

        return response()->json($campaign, 201);
    }

    public function show(Campaign $campaign)
    {
        if ($campaign->advertiser_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json(
            $campaign->load(['applications.creator.creatorProfile', 'applications.deliverables'])
        );
    }

    public function update(Request $request, Campaign $campaign)
    {
        if ($campaign->advertiser_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string', 'max:5000'],
            'brief' => ['sometimes', 'nullable', 'string', 'max:10000'],
            'budget' => ['sometimes', 'numeric', 'min:1'],
            'status' => ['sometimes', 'string', 'in:draft,open,active,completed,cancelled'],
            'category' => ['sometimes', 'nullable', 'string'],
            'requirements' => ['sometimes', 'nullable', 'array'],
            'start_date' => ['sometimes', 'nullable', 'date'],
            'end_date' => ['sometimes', 'nullable', 'date', 'after:start_date'],
            'max_creators' => ['sometimes', 'integer', 'min:1'],
        ]);

        $campaign->update($validated);

        return response()->json($campaign);
    }

    public function destroy(Campaign $campaign)
    {
        if ($campaign->advertiser_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $campaign->delete();

        return response()->json(['message' => 'Campaign deleted']);
    }

    public function applications(Campaign $campaign)
    {
        if ($campaign->advertiser_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return $campaign->applications()->with('creator.creatorProfile')->latest()->paginate(20);
    }

    public function approveApplication(Campaign $campaign, CampaignApplication $application)
    {
        if ($campaign->advertiser_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($application->campaign_id !== $campaign->id) {
            return response()->json(['message' => 'Invalid application'], 422);
        }

        $application->update(['status' => 'accepted']);
        $campaign->update(['status' => 'active']);

        Payment::create([
            'campaign_id' => $campaign->id,
            'advertiser_id' => auth()->id(),
            'creator_id' => $application->creator_id,
            'amount' => $application->proposed_rate ?? $campaign->budget,
            'platform_fee' => ($application->proposed_rate ?? $campaign->budget) * 0.10,
            'status' => 'held',
        ]);

        try {
            $this->notificationService->notifyApplicationStatus(
                $application->creator,
                $campaign,
                'accepted'
            );
        } catch (\Exception $e) {}

        return response()->json($application->fresh());
    }

    public function rejectApplication(Campaign $campaign, CampaignApplication $application)
    {
        if ($campaign->advertiser_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($application->campaign_id !== $campaign->id) {
            return response()->json(['message' => 'Invalid application'], 422);
        }

        $application->update(['status' => 'rejected']);

        try {
            $this->notificationService->notifyApplicationStatus(
                $application->creator,
                $campaign,
                'rejected'
            );
        } catch (\Exception $e) {}

        return response()->json($application->fresh());
    }

    public function approveDeliverable(Deliverable $deliverable)
    {
        $application = $deliverable->application;
        $campaign = $application->campaign;

        if ($campaign->advertiser_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $deliverable->update([
            'status' => 'approved',
            'reviewed_at' => now(),
        ]);

        try {
            $this->notificationService->notifyDeliverableApproved(
                $application->creator,
                $campaign,
                $deliverable
            );
        } catch (\Exception $e) {}

        return response()->json($deliverable->fresh());
    }

    public function requestRevision(Request $request, Deliverable $deliverable)
    {
        $validated = $request->validate([
            'revision_notes' => ['required', 'string', 'max:5000'],
        ]);

        $application = $deliverable->application;
        $campaign = $application->campaign;

        if ($campaign->advertiser_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($deliverable->status !== 'submitted') {
            return response()->json(['message' => 'Deliverable must be submitted first'], 422);
        }

        $deliverable->update([
            'status' => 'revision_requested',
            'revision_notes' => $validated['revision_notes'],
            'reviewed_at' => now(),
        ]);

        $application->update(['status' => 'revision_requested']);

        try {
            $this->notificationService->notifyRevisionRequested(
                $application->creator,
                $campaign,
                $deliverable
            );
        } catch (\Exception $e) {}

        return response()->json($deliverable->fresh());
    }

    public function markShipped(Request $request, Campaign $campaign, CampaignApplication $application)
    {
        if ($campaign->advertiser_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($application->campaign_id !== $campaign->id) {
            return response()->json(['message' => 'Invalid application'], 422);
        }

        if ($application->status !== 'accepted') {
            return response()->json(['message' => 'Application must be accepted first'], 422);
        }

        $validated = $request->validate([
            'tracking_number' => ['nullable', 'string', 'max:255'],
        ]);

        $application->update([
            'shipping_status' => 'shipped',
            'tracking_number' => $validated['tracking_number'] ?? null,
            'shipped_at' => now(),
        ]);

        try {
            $this->notificationService->notifyItemShipped(
                $application->creator,
                $campaign,
                $application
            );
        } catch (\Exception $e) {}

        return response()->json($application->fresh());
    }

    public function invite(User $creator)
    {
        if (!$creator->isCreator()) {
            return response()->json(['message' => 'User is not a creator'], 422);
        }

        Notification::create([
            'user_id' => $creator->id,
            'type' => 'invitation',
            'data' => [
                'advertiser_name' => auth()->user()->name,
                'advertiser_id' => auth()->id(),
                'message' => 'لقد تمت دعوتك للانضمام إلى حملة إعلانية',
            ],
        ]);

        return response()->json(['message' => 'Invitation sent']);
    }

    public function rejectDeliverable(Request $request, Deliverable $deliverable)
    {
        $validated = $request->validate([
            'feedback' => ['required', 'string', 'max:5000'],
        ]);

        $application = $deliverable->application;
        $campaign = $application->campaign;

        if ($campaign->advertiser_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $deliverable->update([
            'status' => 'rejected',
            'notes' => $validated['feedback'],
            'reviewed_at' => now(),
        ]);

        try {
            $this->notificationService->notifyDeliverableRejected(
                $application->creator,
                $campaign,
                $deliverable
            );
        } catch (\Exception $e) {}

        return response()->json($deliverable->fresh());
    }
}
