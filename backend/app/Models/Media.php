<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Media extends Model
{
    protected $fillable = [
        'user_id',
        'file_path',
        'original_name',
        'mime_type',
        'size',
        'collection',
        'model_type',
        'model_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function model()
    {
        return $this->morphTo();
    }

    public function getUrlAttribute(): string
    {
        return url('storage/' . $this->file_path);
    }
}
