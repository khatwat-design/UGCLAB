<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class CreatorLoyalty extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $table = 'creator_loyalty';
    protected $fillable = [
        'id', 'creator_id', 'total_points', 'available_points',
        'tier', 'tier_updated_at', 'current_streak', 'longest_streak',
        'last_login_date', 'grace_days_left', 'streak_frozen',
    ];
    protected function casts(): array
    {
        return [
            'tier_updated_at' => 'datetime',
            'last_login_date' => 'date',
            'streak_frozen' => 'boolean',
        ];
    }
    protected static function boot(): void
    {
        parent::boot();
        static::creating(fn ($model) => $model->id ??= Str::uuid());
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }
}
