<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Campaign extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'advertiser_id',
        'title',
        'description',
        'brief',
        'budget',
        'status',
        'category',
        'requirements',
        'start_date',
        'end_date',
        'max_creators',
    ];

    protected function casts(): array
    {
        return [
            'requirements' => 'array',
            'budget' => 'decimal:2',
            'start_date' => 'date',
            'end_date' => 'date',
            'max_creators' => 'integer',
        ];
    }

    public function advertiser()
    {
        return $this->belongsTo(User::class, 'advertiser_id');
    }

    public function applications()
    {
        return $this->hasMany(CampaignApplication::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
