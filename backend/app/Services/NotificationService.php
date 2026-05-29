<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;

class NotificationService
{
    public function send(User $user, string $type, array $data = []): Notification
    {
        return Notification::create([
            'user_id' => $user->id,
            'type' => $type,
            'data' => $data,
        ]);
    }

    public function sendToRole(string $role, string $type, array $data = []): void
    {
        $users = User::where('role', $role)->where('is_active', true)->get();

        foreach ($users as $user) {
            $this->send($user, $type, $data);
        }
    }

    public function notifyNewApplication($advertiser, $creator, $campaign): void
    {
        $this->send($advertiser, 'new_application', [
            'message' => "{$creator->name} applied to your campaign \"{$campaign->title}\"",
            'campaign_id' => $campaign->id,
            'creator_id' => $creator->id,
        ]);
    }

    public function notifyApplicationStatus($creator, $campaign, string $status): void
    {
        $this->send($creator, 'application_' . $status, [
            'message' => "Your application to \"{$campaign->title}\" was {$status}",
            'campaign_id' => $campaign->id,
        ]);
    }

    public function notifyNewDeliverable($advertiser, $creator, $campaign): void
    {
        $this->send($advertiser, 'new_deliverable', [
            'message' => "{$creator->name} submitted content for \"{$campaign->title}\"",
            'campaign_id' => $campaign->id,
            'creator_id' => $creator->id,
        ]);
    }

    public function notifyPaymentReleased($creator, $campaign, $amount): void
    {
        $this->send($creator, 'payment_released', [
            'message' => "Payment of \${$amount} released for \"{$campaign->title}\"",
            'campaign_id' => $campaign->id,
            'amount' => $amount,
        ]);
    }
}
