<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CreatorProfile extends Model
{
    protected $fillable = [
        'user_id',
        'category',
        'platforms',
        'rates',
        'portfolio_links',
        'followers_count',
        'engagement_rate',
        'is_verified',
    ];

    protected function casts(): array
    {
        return [
            'platforms' => 'array',
            'rates' => 'array',
            'portfolio_links' => 'array',
            'is_verified' => 'boolean',
            'followers_count' => 'integer',
            'engagement_rate' => 'decimal:2',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
