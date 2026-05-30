<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contacts', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('email');
            $t->string('phone')->nullable();
            $t->string('company')->nullable();
            $t->string('subject')->nullable();
            $t->text('message');
            $t->string('ip')->nullable();
            $t->string('user_agent')->nullable();
            $t->boolean('is_read')->default(false);
            $t->timestamps();
            $t->index(['is_read', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contacts');
    }
};
