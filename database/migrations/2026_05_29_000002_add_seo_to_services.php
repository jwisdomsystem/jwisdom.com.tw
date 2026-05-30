<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('services', function (Blueprint $t) {
            $t->string('meta_title', 200)->nullable()->after('is_published');
            $t->string('meta_description', 500)->nullable()->after('meta_title');
        });
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $t) {
            $t->dropColumn(['meta_title', 'meta_description']);
        });
    }
};
