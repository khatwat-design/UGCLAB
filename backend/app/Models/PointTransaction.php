<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PointTransaction extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;
    protected $fillable = [
        'id', 'creator_id', 'amount', 'type', 'source',
        'reference_type', 'reference_id', 'expires_at', 'expired_processed_at',
    ];
    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'expired_processed_at' => 'datetime',
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
