<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name', 'en', 'tag', 'description', 'url', 'features', 'accent', 'sort', 'is_active',
    ];

    protected $casts = [
        'features' => 'array',
        'is_active' => 'boolean',
    ];

    public function scopeActive(Builder $q): Builder
    {
        return $q->where('is_active', true);
    }
}
