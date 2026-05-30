<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    protected $fillable = [
        'zone', 'title', 'subtitle', 'body', 'image', 'url',
        'cta_label', 'accent', 'sort', 'is_active', 'starts_at', 'ends_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    public function scopeActive(Builder $q): Builder
    {
        $now = now();

        return $q->where('is_active', true)
            ->where(fn ($w) => $w->whereNull('starts_at')->orWhere('starts_at', '<=', $now))
            ->where(fn ($w) => $w->whereNull('ends_at')->orWhere('ends_at', '>=', $now));
    }

    public function scopeZone(Builder $q, string $zone): Builder
    {
        return $q->where('zone', $zone);
    }
}
