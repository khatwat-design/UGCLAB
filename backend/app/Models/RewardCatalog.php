<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class RewardCatalog extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;
    protected $table = 'rewards_catalog';
    protected $fillable = [
        'id', 'name', 'category', 'points_cost', 'min_tier',
        'unit_cost_usd', 'stock', 'is_active', 'delivery_days',
        'image_url', 'description',
    ];
    protected function casts(): array
    {
        return [
            'unit_cost_usd' => 'decimal:2',
            'is_active' => 'boolean',
            'stock' => 'integer',
            'delivery_days' => 'integer',
        ];
    }
    protected static function boot(): void
    {
        parent::boot();
        static::creating(fn ($model) => $model->id ??= Str::uuid());
    }
}
