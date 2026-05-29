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
    ];

    protected function casts(): array
    {
        return [
            'proposed_rate' => 'decimal:2',
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
