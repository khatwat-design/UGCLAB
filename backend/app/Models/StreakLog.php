<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class StreakLog extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;
    protected $table = 'streak_logs';
    protected $fillable = ['id', 'creator_id', 'date', 'used_grace', 'points_earned'];
    protected function casts(): array
    {
        return [
            'date' => 'date',
            'used_grace' => 'boolean',
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
