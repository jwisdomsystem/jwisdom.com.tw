<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    protected $fillable = [
        'name', 'email', 'phone', 'company', 'subject', 'message',
        'ip', 'user_agent', 'is_read',
    ];

    protected $casts = ['is_read' => 'boolean'];
}
