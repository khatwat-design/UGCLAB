<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PlatformRevenueSnapshot extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;
    protected $fillable = [
        'id', 'month', 'total_revenue', 'reward_budget',
        'spent_on_rewards', 'is_finalized',
    ];
    protected function casts(): array
    {
        return [
            'month' => 'date',
            'total_revenue' => 'decimal:2',
            'reward_budget' => 'decimal:2',
            'spent_on_rewards' => 'decimal:2',
            'is_finalized' => 'boolean',
        ];
    }
    protected static function boot(): void
    {
        parent::boot();
        static::creating(fn ($model) => $model->id ??= Str::uuid());
    }
}
