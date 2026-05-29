<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CampaignApplication extends Model
{
    protected $fillable = [
        'campaign_id',
        'creator_id',
        'proposal',
        'proposed_rate',
        'status',
        'shipping_status',
        'tracking_number',
        'shipped_at',
        'received_at',
    ];

    protected function casts(): array
    {
        return [
            'proposed_rate' => 'decimal:2',
            'shipped_at' => 'datetime',
            'received_at' => 'datetime',
        ];
    }

    public function campaign()
    {
        return $this->belongsTo(Campaign::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function deliverables()
    {
        return $this->hasMany(Deliverable::class, 'application_id');
    }
}
