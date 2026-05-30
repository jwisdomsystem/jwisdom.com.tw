<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Partner extends Model
{
    protected $fillable = ['name', 'logo', 'url', 'sort', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function scopeActive(Builder $q): Builder
    {
        return $q->where('is_active', true);
    }
}
