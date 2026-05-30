<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    protected $fillable = ['key', 'title', 'body', 'meta_title', 'meta_description'];

    public function getRouteKeyName(): string
    {
        return 'key';
    }
}
