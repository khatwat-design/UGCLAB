<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdvertiserProfile extends Model
{
    protected $fillable = [
        'user_id',
        'company_name',
        'company_website',
        'industry',
        'tax_id',
        'billing_address',
        'is_verified',
    ];

    protected function casts(): array
    {
        return [
            'is_verified' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
