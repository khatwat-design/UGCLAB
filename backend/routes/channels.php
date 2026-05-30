<?php

use App\Models\CampaignApplication;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('user.{userId}', function (User $user, $userId) {
    return (int) $user->id === (int) $userId;
});

Broadcast::channel('campaign.{campaignId}', function (User $user, $campaignId) {
    return $user->campaigns()->where('id', $campaignId)->exists()
        || $user->applications()->where('campaign_id', $campaignId)->exists();
});

Broadcast::channel('conversation.{userId1}.{userId2}', function (User $user, $userId1, $userId2) {
    return (int) $user->id === (int) $userId1 || (int) $user->id === (int) $userId2;
});

Broadcast::channel('admin', function (User $user) {
    return $user->role === 'admin';
});
