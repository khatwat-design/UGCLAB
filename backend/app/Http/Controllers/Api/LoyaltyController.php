<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PointTransaction;
use App\Models\RewardCatalog;
use App\Models\RewardRedemption;
use App\Models\StreakLog;
use App\Services\LoyaltyService;
use App\Services\RevenueService;
use Illuminate\Http\Request;

class LoyaltyController extends Controller
{
    public function __construct(
        private LoyaltyService $loyaltyService,
        private RevenueService $revenueService
    ) {}

    public function me()
    {
        $user = auth()->user();

        if ($user->role !== 'creator') {
            return response()->json(['message' => 'Only creators have loyalty'], 403);
        }

        return response()->json($this->loyaltyService->getLoyaltyData($user->id));
    }

    public function dailyLogin()
    {
        $user = auth()->user();

        if ($user->role !== 'creator') {
            return response()->json(['message' => 'Only creators have loyalty'], 403);
        }

        return response()->json($this->loyaltyService->processDailyLogin($user->id));
    }

    public function transactions(Request $request)
    {
        $user = auth()->user();

        if ($user->role !== 'creator') {
            return response()->json(['message' => 'Only creators have loyalty'], 403);
        }

        $perPage = min((int) $request->input('per_page', 20), 50);

        $transactions = PointTransaction::where('creator_id', $user->id)
            ->latest()
            ->paginate($perPage);

        $expiringThisMonth = PointTransaction::where('creator_id', $user->id)
            ->where('type', 'earn')
            ->whereBetween('expires_at', [now(), now()->endOfMonth()])
            ->sum('amount');

        return response()->json([
            'data' => $transactions->items(),
            'meta' => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total(),
                'expiring_this_month' => $expiringThisMonth,
            ],
        ]);
    }

    public function rewards()
    {
        $user = auth()->user();

        $loyalty = $this->loyaltyService->getLoyaltyData($user->id);
        $budget = $this->revenueService->getCurrentRewardBudget();

        $rewards = RewardCatalog::where('is_active', true)
            ->where('min_tier', '<=', $loyalty['tier'])
            ->orderBy('points_cost')
            ->get()
            ->map(function ($reward) use ($loyalty, $budget) {
                return [
                    'id' => $reward->id,
                    'name' => $reward->name,
                    'description' => $reward->description,
                    'category' => $reward->category,
                    'points_cost' => $reward->points_cost,
                    'min_tier' => $reward->min_tier,
                    'image_url' => $reward->image_url,
                    'stock' => $reward->stock,
                    'delivery_days' => $reward->delivery_days,
                    'is_affordable' => $loyalty['available_points'] >= $reward->points_cost,
                    'budget_available' => $budget['remaining_budget'] >= (float) $reward->unit_cost_usd,
                    'available_points' => $loyalty['available_points'],
                    'user_tier' => $loyalty['tier'],
                ];
            });

        return response()->json([
            'data' => $rewards,
            'meta' => [
                'available_points' => $loyalty['available_points'],
                'user_tier' => $loyalty['tier'],
                'budget_remaining' => $budget['remaining_budget'],
            ],
        ]);
    }

    public function redeem(Request $request)
    {
        $request->validate([
            'reward_id' => ['required', 'string', 'exists:rewards_catalog,id'],
            'address' => ['required', 'array'],
            'address.street' => ['required', 'string', 'max:255'],
            'address.city' => ['required', 'string', 'max:100'],
            'address.state' => ['required', 'string', 'max:100'],
            'address.phone' => ['required', 'string', 'max:20'],
            'address.full_name' => ['required', 'string', 'max:255'],
        ]);

        $user = auth()->user();

        if ($user->role !== 'creator') {
            return response()->json(['message' => 'Only creators can redeem rewards'], 403);
        }

        $result = $this->loyaltyService->redeemReward(
            $user->id,
            $request->input('reward_id'),
            $request->input('address')
        );

        if (!$result['success']) {
            $messages = [
                'INSUFFICIENT_POINTS' => 'نقاط غير كافية',
                'TIER_REQUIRED' => 'المرتبة الحالية لا تؤهلك لاستبدال هذه المكافأة',
                'OUT_OF_STOCK' => 'المكافأة نفدت من المخزون',
                'REWARD_BUDGET_EXHAUSTED' => 'المكافآت المادية نفدت هذا الشهر، عُد الشهر القادم',
                'REWARD_NOT_FOUND' => 'المكافأة غير موجودة',
            ];

            return response()->json([
                'message' => $messages[$result['error']] ?? 'حدث خطأ',
                'code' => $result['error'],
            ], 422);
        }

        return response()->json($result['redemption'], 201);
    }

    public function redemptions()
    {
        $user = auth()->user();

        if ($user->role !== 'creator') {
            return response()->json(['message' => 'Only creators have redemptions'], 403);
        }

        return response()->json(
            RewardRedemption::where('creator_id', $user->id)
                ->with('reward')
                ->latest()
                ->paginate(20)
        );
    }

    public function streak()
    {
        $user = auth()->user();

        if ($user->role !== 'creator') {
            return response()->json(['message' => 'Only creators have loyalty'], 403);
        }

        $streakWeek = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $log = StreakLog::where('creator_id', $user->id)->where('date', $date)->first();
            $streakWeek[] = [
                'date' => $date,
                'status' => $log ? 'done' : ($i === 0 ? 'today' : 'missed'),
                'points' => $log?->points_earned ?? 0,
                'day_name' => now()->subDays($i)->locale('ar')->dayName,
            ];
        }

        return response()->json(['streak_week' => $streakWeek]);
    }
}
