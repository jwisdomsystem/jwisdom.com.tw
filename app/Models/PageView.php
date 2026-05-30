<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PageView extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = ['path', 'referrer', 'ip', 'user_agent', 'created_at'];

    protected $casts = ['created_at' => 'datetime'];
}
