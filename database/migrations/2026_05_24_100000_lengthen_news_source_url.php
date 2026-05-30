<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Google News RSS 連結常超過 700 字元，原 varchar 會 1406 截斷錯誤
        Schema::table('news', function (Blueprint $table) {
            $table->text('source_url')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('news', function (Blueprint $table) {
            $table->string('source_url')->nullable()->change();
        });
    }
};
