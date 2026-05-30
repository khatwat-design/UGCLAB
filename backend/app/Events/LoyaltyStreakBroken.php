<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

class LoyaltyStreakBroken implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(
        public int $creatorId,
        public int $lostStreak
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('user.' . $this->creatorId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'loyalty:streak_broken';
    }

    public function broadcastWith(): array
    {
        return [
            'creator_id' => $this->creatorId,
            'lost_streak' => $this->lostStreak,
        ];
    }
}
