<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

class LoyaltyPointsEarned implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(
        public int $creatorId,
        public int $amount,
        public string $source,
        public int $newTotal
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('user.' . $this->creatorId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'loyalty:points_earned';
    }

    public function broadcastWith(): array
    {
        return [
            'creator_id' => $this->creatorId,
            'amount' => $this->amount,
            'source' => $this->source,
            'new_total' => $this->newTotal,
        ];
    }
}
