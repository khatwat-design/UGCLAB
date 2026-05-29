<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SettlementRequest extends Model
{
    protected $fillable = [
        'user_id',
        'amount',
        'status',
        'admin_notes',
        'processed_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'processed_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
