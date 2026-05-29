<?php

namespace App\Http\Controllers\Api;

use App\Models\Review;
use App\Models\Campaign;
use App\Models\CampaignApplication;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class ReviewController extends Controller
{
    public function __construct(
        private NotificationService $notificationService
    ) {}

    public function store(Request $request)
    {
        $validated = $request->validate([
            'campaign_id' => ['required', 'exists:campaigns,id'],
            'reviewee_id' => ['required', 'exists:users,id'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);

        $user = auth()->user();

        if ($user->id === $validated['reviewee_id']) {
            return response()->json(['message' => 'لا يمكنك تقييم نفسك'], 422);
        }

        $exists = Review::where('campaign_id', $validated['campaign_id'])
            ->where('reviewer_id', $user->id)
            ->where('reviewee_id', $validated['reviewee_id'])
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'لقد قمت بتقييم هذا المستخدم بالفعل'], 422);
        }

        $application = CampaignApplication::where('campaign_id', $validated['campaign_id'])
            ->where(function ($q) use ($user, $validated) {
                $q->where('creator_id', $user->id)->orWhere('creator_id', $validated['reviewee_id']);
            })
            ->first();

        if (!$application || $application->status !== 'completed') {
            return response()->json(['message' => 'لا يمكن التقييم إلا بعد اكتمال الحملة'], 422);
        }

        $review = Review::create([
            'campaign_id' => $validated['campaign_id'],
            'reviewer_id' => $user->id,
            'reviewee_id' => $validated['reviewee_id'],
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
        ]);

        try {
            $campaign = Campaign::find($validated['campaign_id']);
            $this->notificationService->send(
                \App\Models\User::find($validated['reviewee_id']),
                'new_review',
                [
                    'message' => "قام {$user->name} بتقييمك في حملة \"{$campaign->title}\"",
                    'campaign_id' => $campaign->id,
                    'rating' => $validated['rating'],
                ]
            );
        } catch (\Exception $e) {}

        return response()->json($review->load(['reviewer', 'reviewee']), 201);
    }

    public function campaign(Campaign $campaign)
    {
        return Review::where('campaign_id', $campaign->id)
            ->with(['reviewer', 'reviewee'])
            ->latest()
            ->get();
    }

    public function user(\App\Models\User $user)
    {
        return Review::where('reviewee_id', $user->id)
            ->with(['reviewer', 'campaign'])
            ->latest()
            ->paginate(12);
    }
}
