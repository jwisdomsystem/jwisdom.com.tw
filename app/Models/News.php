<?php

namespace App\Models;

use App\Models\Concerns\HasTranslations;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class News extends Model
{
    use HasTranslations;

    protected $table = 'news';

    protected array $translatable = [
        'title', 'category', 'excerpt', 'body', 'source_name', 'meta_title', 'meta_description',
    ];

    protected $fillable = [
        'translations',
        'title', 'slug', 'category', 'type', 'excerpt', 'body', 'cover',
        'cover_gradient', 'source_name', 'source_url', 'is_published',
        'published_at', 'meta_title', 'meta_description',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'published_at' => 'datetime',
    ];

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function scopePublished(Builder $q): Builder
    {
        return $q->where('is_published', true)
            ->where(fn ($w) => $w->whereNull('published_at')->orWhere('published_at', '<=', now()));
    }

    public function scopeType(Builder $q, string $type): Builder
    {
        return $q->where('type', $type);
    }
}
