<?php

namespace App\Models;

use App\Models\Concerns\HasTranslations;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Work extends Model
{
    use HasTranslations;

    protected array $translatable = ['name', 'category', 'summary', 'body', 'meta_title', 'meta_description'];

    protected $fillable = [
        'translations',
        'name', 'slug', 'category', 'summary', 'body', 'cover',
        'cover_gradient', 'year', 'url', 'sort', 'is_published',
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
