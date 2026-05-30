<?php

namespace App\Services;

use App\Events\LoyaltyMilestoneReached;
use App\Events\LoyaltyPointsEarned;
use App\Events\LoyaltyStreakBroken;
use App\Events\LoyaltyTierUpgrade;
use App\Models\CreatorLoyalty;
use App\Models\PlatformRevenueSnapshot;
use App\Models\PlatformSetting;
use App\Models\PointTransaction;
use App\Models\RewardCatalog;
use App\Models\RewardRedemption;
use App\Models\StreakLog;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class LoyaltyService
{
    private const TIER_THRESHOLDS = [
        'rising' => 0,
        'creator' => 500,
        'pro' => 2000,
        'elite' => 5000,
    ];

    private const MILESTONES = [
        7 => 50,
        30 => 200,
        60 => 500,
        100 => 1000,
    ];

    public function __construct(
        private RevenueService $revenueService
    ) {}

    public function awardPoints(
        int $creatorId,
        int $amount,
        string $source,
        ?string $referenceType = null,
        ?int $referenceId = null
    ): array {
        $maxDaily = PlatformSetting::getValue('max_daily_points', 200);

        return DB::transaction(function () use ($creatorId, $amount, $source, $referenceType, $referenceId, $maxDaily) {
            $todayPoints = PointTransaction::where('creator_id', $creatorId)
                ->whereDate('created_at', today())
                ->where('type', 'earn')
                ->sum('amount');

            $actualAmount = min($amount, $maxDaily - $todayPoints);
            if ($actualAmount <= 0) {
                return ['points_awarded' => 0, 'new_total' => 0, 'tier_upgraded' => false];
            }

            $expiresAt = now()->addDays(PlatformSetting::getValue('points_expiry_days', 365));

            $loyalty = $this->getOrCreateLoyalty($creatorId);

            PointTransaction::create([
                'creator_id' => $creatorId,
                'amount' => $actualAmount,
                'type' => 'earn',
                'source' => $source,
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
                'expires_at' => $expiresAt,
            ]);

            $loyalty->increment('total_points', $actualAmount);
            $loyalty->increment('available_points', $actualAmount);

            $oldTier = $loyalty->tier;
            $tierUpgraded = $this->checkAndUpdateTier($creatorId);

            LoyaltyPointsEarned::dispatch($creatorId, $actualAmount, $source, $loyalty->fresh()->available_points);

            return [
                'points_awarded' => $actualAmount,
                'new_total' => $loyalty->fresh()->available_points,
                'tier_upgraded' => $tierUpgraded,
            ];
        });
    }

    public function checkAndUpdateTier(int $creatorId): bool
    {
        $loyalty = $this->getOrCreateLoyalty($creatorId);
        $oldTier = $loyalty->tier;

        $ninetyDaysAgo = now()->subDays(90);
        $points90d = PointTransaction::where('creator_id', $creatorId)
            ->where('type', 'earn')
            ->where('created_at', '>=', $ninetyDaysAgo)
            ->sum('amount');

        $newTier = 'rising';
        foreach (['elite' => 5000, 'pro' => 2000, 'creator' => 500] as $tier => $threshold) {
            if ($points90d >= $threshold) {
                $newTier = $tier;
                break;
            }
        }

        if ($newTier !== $oldTier) {
            $loyalty->update([
                'tier' => $newTier,
                'tier_updated_at' => now(),
            ]);

            LoyaltyTierUpgrade::dispatch($creatorId, $oldTier, $newTier);
            return true;
        }

        return false;
    }

    public function processDailyLogin(int $creatorId): array
    {
        $loyalty = $this->getOrCreateLoyalty($creatorId);
        $today = today()->toDateString();

        if ($loyalty->last_login_date?->toDateString() === $today) {
            return [
                'already_logged' => true,
                'points_earned' => 0,
                'streak' => $loyalty->current_streak,
                'milestone_bonus' => 0,
            ];
        }

        $yesterday = now()->subDay()->toDateString();
        $lastDate = $loyalty->last_login_date?->toDateString();

        if ($lastDate === $yesterday) {
            $loyalty->increment('current_streak');
        } elseif ($lastDate && $lastDate < $yesterday) {
            if ($loyalty->grace_days_left > 0 && !$loyalty->streak_frozen) {
                $loyalty->decrement('grace_days_left');
            } else {
                $lostStreak = $loyalty->current_streak;
                $loyalty->current_streak = 1;
                if ($lostStreak > 0) {
                    LoyaltyStreakBroken::dispatch($creatorId, $lostStreak);
                }
            }
        } else {
            $loyalty->current_streak = 1;
        }

        $loginPoints = PlatformSetting::getValue('login_points', 5);

        $streak = $loyalty->current_streak;
        $milestoneBonus = 0;
        foreach (self::MILESTONES as $days => $bonus) {
            if ($streak === $days) {
                $milestoneBonus = (int) PlatformSetting::getValue("streak_milestone_{$days}", $bonus);
                break;
            }
        }

        $totalEarned = $loginPoints + $milestoneBonus;

        if ($loyalty->longest_streak < $streak) {
            $loyalty->longest_streak = $streak;
        }

        $loyalty->last_login_date = today();
        $loyalty->streak_frozen = false;
        $loyalty->save();

        StreakLog::create([
            'creator_id' => $creatorId,
            'date' => $today,
            'used_grace' => false,
            'points_earned' => $totalEarned,
        ]);

        if ($totalEarned > 0) {
            $this->awardPoints($creatorId, $totalEarned, 'daily_login');
        }

        if ($milestoneBonus > 0) {
            LoyaltyMilestoneReached::dispatch($creatorId, $streak, $milestoneBonus);
        }

        return [
            'already_logged' => false,
            'points_earned' => $totalEarned,
            'streak' => $streak,
            'milestone_bonus' => $milestoneBonus,
        ];
    }

    public function redeemReward(int $creatorId, string $rewardId, array $addressData): array
    {
        return DB::transaction(function () use ($creatorId, $rewardId, $addressData) {
            $reward = RewardCatalog::where('id', $rewardId)->where('is_active', true)->first();
            if (!$reward) {
                return ['success' => false, 'error' => 'REWARD_NOT_FOUND'];
            }

            $loyalty = $this->getOrCreateLoyalty($creatorId);

            if ($loyalty->available_points < $reward->points_cost) {
                return ['success' => false, 'error' => 'INSUFFICIENT_POINTS'];
            }

            $tierOrder = ['rising' => 0, 'creator' => 1, 'pro' => 2, 'elite' => 3];
            if (($tierOrder[$loyalty->tier] ?? 0) < ($tierOrder[$reward->min_tier] ?? 0)) {
                return ['success' => false, 'error' => 'TIER_REQUIRED'];
            }

            if ($reward->stock !== null && $reward->stock <= 0) {
                return ['success' => false, 'error' => 'OUT_OF_STOCK'];
            }

            $budget = $this->revenueService->getCurrentRewardBudget();
            if ($budget['remaining_budget'] < (float) $reward->unit_cost_usd) {
                return ['success' => false, 'error' => 'REWARD_BUDGET_EXHAUSTED'];
            }

            $loyalty->decrement('available_points', $reward->points_cost);

            PointTransaction::create([
                'creator_id' => $creatorId,
                'amount' => -$reward->points_cost,
                'type' => 'spend',
                'source' => 'redemption',
                'reference_type' => 'reward',
                'reference_id' => $rewardId,
            ]);

            $redemption = RewardRedemption::create([
                'creator_id' => $creatorId,
                'reward_id' => $rewardId,
                'points_used' => $reward->points_cost,
                'status' => 'pending',
                'address_snapshot' => $addressData,
            ]);

            if ($reward->stock !== null) {
                $reward->decrement('stock');
            }

            $monthStart = now()->startOfMonth()->toDateString();
            PlatformRevenueSnapshot::where('month', $monthStart)
                ->increment('spent_on_rewards', $reward->unit_cost_usd);

            return [
                'success' => true,
                'redemption' => $redemption->load('reward'),
            ];
        });
    }

    public function expireOldPoints(): void
    {
        $expiredTransactions = PointTransaction::where('type', 'earn')
            ->where('expires_at', '<', now())
            ->whereNull('expired_processed_at')
            ->get();

        foreach ($expiredTransactions as $txn) {
            DB::transaction(function () use ($txn) {
                $remainingPoints = $txn->amount;

                $spentAmount = PointTransaction::where('creator_id', $txn->creator_id)
                    ->where('type', 'spend')
                    ->where('created_at', '>=', $txn->created_at)
                    ->sum('amount');

                $effectiveRemaining = $remainingPoints + $spentAmount;
                if ($effectiveRemaining > 0) {
                    $loyalty = $this->getOrCreateLoyalty($txn->creator_id);
                    $loyalty->decrement('available_points', $effectiveRemaining);

                    PointTransaction::create([
                        'creator_id' => $txn->creator_id,
                        'amount' => -$effectiveRemaining,
                        'type' => 'expire',
                        'source' => 'expiry',
                        'reference_type' => 'point_transaction',
                        'reference_id' => $txn->id,
                    ]);
                }

                $txn->update(['expired_processed_at' => now()]);
            });
        }
    }

    public function getLoyaltyData(int $creatorId): array
    {
        $loyalty = $this->getOrCreateLoyalty($creatorId);
        $tierPoints = PlatformSetting::getValue("tier_{$loyalty->tier}_min", 0);

        $nextTier = null;
        $nextTierPoints = 0;
        $tiers = ['rising' => 'creator', 'creator' => 'pro', 'pro' => 'elite'];
        if (isset($tiers[$loyalty->tier])) {
            $nextTier = $tiers[$loyalty->tier];
            $nextTierPoints = (int) PlatformSetting::getValue("tier_{$nextTier}_min", 0);
        }

        $ninetyDaysAgo = now()->subDays(90);
        $points90d = PointTransaction::where('creator_id', $creatorId)
            ->where('type', 'earn')
            ->where('created_at', '>=', $ninetyDaysAgo)
            ->sum('amount');

        $streakWeek = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $log = StreakLog::where('creator_id', $creatorId)->where('date', $date)->first();
            $streakWeek[] = [
                'date' => $date,
                'status' => $log ? 'done' : ($i === 0 ? 'today' : 'missed'),
                'points' => $log?->points_earned ?? 0,
                'day_name' => now()->subDays($i)->locale('ar')->dayName,
            ];
        }

        return [
            'total_points' => $loyalty->total_points,
            'available_points' => $loyalty->available_points,
            'tier' => $loyalty->tier,
            'tier_updated_at' => $loyalty->tier_updated_at,
            'current_streak' => $loyalty->current_streak,
            'longest_streak' => $loyalty->longest_streak,
            'grace_days_left' => $loyalty->grace_days_left,
            'streak_frozen' => $loyalty->streak_frozen,
            'points_90d' => $points90d,
            'next_tier' => $nextTier,
            'next_tier_points_needed' => max(0, $nextTierPoints - $points90d),
            'streak_week' => $streakWeek,
        ];
    }

    private function getOrCreateLoyalty(int $creatorId): CreatorLoyalty
    {
        return CreatorLoyalty::firstOrCreate(
            ['creator_id' => $creatorId],
            [
                'total_points' => 0,
                'available_points' => 0,
                'tier' => 'rising',
                'current_streak' => 0,
                'longest_streak' => 0,
                'grace_days_left' => (int) PlatformSetting::getValue('grace_days_max', 1),
            ]
        );
    }
}
