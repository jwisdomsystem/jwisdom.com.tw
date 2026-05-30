<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable = [
        'title', 'slug', 'summary', 'body', 'icon',
        'icon_bg', 'icon_text', 'sort', 'is_published',
    ];

    protected $casts = ['is_published' => 'boolean'];

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function scopePublished(Builder $q): Builder
    {
        return $q->where('is_published', true);
    }
}
