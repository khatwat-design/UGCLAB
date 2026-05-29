<?php

namespace App\Services;

use App\Models\User;
use App\Models\Campaign;
use App\Models\Payment;
use App\Models\CampaignApplication;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    public function platformStats(): array
    {
        return [
            'total_users' => User::count(),
            'creators' => User::where('role', 'creator')->count(),
            'advertisers' => User::where('role', 'advertiser')->count(),
            'campaigns' => Campaign::count(),
            'active_campaigns' => Campaign::whereIn('status', ['open', 'active'])->count(),
            'completed_campaigns' => Campaign::where('status', 'completed')->count(),
            'total_applications' => CampaignApplication::count(),
            'total_revenue' => Payment::where('status', 'released')->sum('platform_fee'),
            'total_volume' => Payment::where('status', 'released')->sum('amount'),
            'pending_payments' => Payment::where('status', 'held')->sum('amount'),
        ];
    }

    public function monthlyStats(int $months = 6): array
    {
        $data = [];

        for ($i = $months - 1; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $start = $date->copy()->startOfMonth();
            $end = $date->copy()->endOfMonth();

            $data[] = [
                'month' => $date->format('Y-m'),
                'new_users' => User::whereBetween('created_at', [$start, $end])->count(),
                'new_campaigns' => Campaign::whereBetween('created_at', [$start, $end])->count(),
                'revenue' => Payment::where('status', 'released')
                    ->whereBetween('released_at', [$start, $end])
                    ->sum('platform_fee'),
                'volume' => Payment::where('status', 'released')
                    ->whereBetween('released_at', [$start, $end])
                    ->sum('amount'),
            ];
        }

        return $data;
    }

    public function topCreators(int $limit = 10)
    {
        return User::where('role', 'creator')
            ->where('is_active', true)
            ->with('creatorProfile')
            ->withCount(['applications as completed_applications' => function ($q) {
                $q->where('status', 'completed');
            }])
            ->orderByDesc('completed_applications')
            ->limit($limit)
            ->get();
    }
}
