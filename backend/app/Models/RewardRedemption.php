<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class RewardRedemption extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;
    protected $fillable = [
        'id', 'creator_id', 'reward_id', 'points_used',
        'status', 'address_snapshot', 'fulfilled_at',
    ];
    protected function casts(): array
    {
        return [
            'address_snapshot' => 'json',
            'fulfilled_at' => 'datetime',
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

    public function reward()
    {
        return $this->belongsTo(RewardCatalog::class, 'reward_id');
    }
}
