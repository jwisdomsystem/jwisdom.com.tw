<?php

namespace App\Models;

use App\Models\Concerns\HasTranslations;
use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    use HasTranslations;

    protected array $translatable = ['title', 'body', 'meta_title', 'meta_description'];

    protected $fillable = ['translations', 'key', 'title', 'body', 'meta_title', 'meta_description'];

    public function getRouteKeyName(): string
    {
        return 'key';
    }
}
