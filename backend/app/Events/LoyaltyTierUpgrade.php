<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

class LoyaltyTierUpgrade implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(
        public int $creatorId,
        public string $oldTier,
        public string $newTier
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('user.' . $this->creatorId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'loyalty:tier_upgrade';
    }

    public function broadcastWith(): array
    {
        return [
            'creator_id' => $this->creatorId,
            'old_tier' => $this->oldTier,
            'new_tier' => $this->newTier,
        ];
    }
}
