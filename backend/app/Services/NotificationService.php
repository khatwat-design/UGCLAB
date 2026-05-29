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

    public function notifyDeliverableApproved($creator, $campaign, $deliverable): void
    {
        $this->send($creator, 'deliverable_approved', [
            'message' => "Your content for \"{$campaign->title}\" has been approved",
            'campaign_id' => $campaign->id,
            'deliverable_id' => $deliverable->id,
        ]);
    }

    public function notifyDeliverableRejected($creator, $campaign, $deliverable): void
    {
        $this->send($creator, 'deliverable_rejected', [
            'message' => "Your content for \"{$campaign->title}\" was rejected",
            'campaign_id' => $campaign->id,
            'deliverable_id' => $deliverable->id,
            'feedback' => $deliverable->notes,
        ]);
    }

    public function notifyRevisionRequested($creator, $campaign, $deliverable): void
    {
        $this->send($creator, 'revision_requested', [
            'message' => "Revision requested for \"{$campaign->title}\"",
            'campaign_id' => $campaign->id,
            'deliverable_id' => $deliverable->id,
            'revision_notes' => $deliverable->revision_notes,
        ]);
    }

    public function notifyItemShipped($creator, $campaign, $application): void
    {
        $this->send($creator, 'item_shipped', [
            'message' => "Product for \"{$campaign->title}\" has been shipped",
            'campaign_id' => $campaign->id,
            'application_id' => $application->id,
            'tracking_number' => $application->tracking_number,
        ]);
    }

    public function notifyItemReceived($advertiser, $campaign, $application): void
    {
        $this->send($advertiser, 'item_received', [
            'message' => "Product for \"{$campaign->title}\" has been received by the creator",
            'campaign_id' => $campaign->id,
            'application_id' => $application->id,
        ]);
    }

    public function notifyNewSettlementRequest($admin, $creator, $amount): void
    {
        $this->send($admin, 'settlement_requested', [
            'message' => "{$creator->name} requested settlement of \${$amount}",
            'user_id' => $creator->id,
            'amount' => $amount,
        ]);
    }

    public function notifySettlementProcessed($creator, $request, string $status): void
    {
        $this->send($creator, 'settlement_' . $status, [
            'message' => "Your settlement request of \${$request->amount} was {$status}",
            'amount' => $request->amount,
            'admin_notes' => $request->admin_notes,
        ]);
    }
}
