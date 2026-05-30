<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

class LoyaltyMilestoneReached implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(
        public int $creatorId,
        public int $streakDays,
        public int $bonusPoints
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('user.' . $this->creatorId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'loyalty:milestone';
    }

    public function broadcastWith(): array
    {
        return [
            'creator_id' => $this->creatorId,
            'streak_days' => $this->streakDays,
            'bonus_points' => $this->bonusPoints,
        ];
    }
}
