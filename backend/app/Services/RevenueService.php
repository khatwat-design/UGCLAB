<?php

namespace App\Services;

use App\Models\PlatformRevenueSnapshot;
use App\Models\PlatformSetting;
use Illuminate\Support\Facades\DB;

class RevenueService
{
    public function recordTransaction(
        int $campaignId,
        float $campaignValue,
        bool $isGuildMember
    ): void {
        $platformFeeRate = PlatformSetting::getValue('platform_fee_rate', 0.10);
        $guildRate = $isGuildMember ? PlatformSetting::getValue('guild_commission_rate', 0.02) : 0;

        $ugclabRevenue = $campaignValue * ($platformFeeRate - $guildRate);
        $rewardBudgetRatio = PlatformSetting::getValue('reward_budget_ratio', 0.08);

        DB::transaction(function () use ($ugclabRevenue, $rewardBudgetRatio) {
            $monthStart = now()->startOfMonth()->toDateString();

            $snapshot = PlatformRevenueSnapshot::firstOrCreate(
                ['month' => $monthStart],
                [
                    'total_revenue' => 0,
                    'reward_budget' => 0,
                    'spent_on_rewards' => 0,
                ]
            );

            $snapshot->increment('total_revenue', $ugclabRevenue);
            $snapshot->reward_budget = $snapshot->total_revenue * $rewardBudgetRatio;
            $snapshot->save();
        });
    }

    public function finalizeMonthAndRollover(): void
    {
        $lastMonth = now()->subMonth()->startOfMonth()->toDateString();

        DB::transaction(function () use ($lastMonth) {
            $snapshot = PlatformRevenueSnapshot::where('month', $lastMonth)->first();
            if ($snapshot) {
                $snapshot->update(['is_finalized' => true]);
            }

            $thisMonth = now()->startOfMonth()->toDateString();
            PlatformRevenueSnapshot::firstOrCreate(
                ['month' => $thisMonth],
                [
                    'total_revenue' => 0,
                    'reward_budget' => 0,
                    'spent_on_rewards' => 0,
                ]
            );
        });
    }

    public function getCurrentRewardBudget(): array
    {
        $monthStart = now()->startOfMonth()->toDateString();
        $snapshot = PlatformRevenueSnapshot::firstOrCreate(
            ['month' => $monthStart],
            [
                'total_revenue' => 0,
                'reward_budget' => 0,
                'spent_on_rewards' => 0,
            ]
        );

        $remaining = max(0, $snapshot->reward_budget - $snapshot->spent_on_rewards);

        return [
            'total_revenue' => (float) $snapshot->total_revenue,
            'reward_budget' => (float) $snapshot->reward_budget,
            'spent_on_rewards' => (float) $snapshot->spent_on_rewards,
            'remaining_budget' => $remaining,
        ];
    }
}
