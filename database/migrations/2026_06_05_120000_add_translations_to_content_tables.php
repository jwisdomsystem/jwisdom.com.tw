<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tables that hold user-facing content needing per-locale translations.
     * Each gets a nullable JSON `translations` column shaped as
     * { "en": { "<field>": "<value>", ... } }. Missing keys fall back to the
     * base (zh-TW) column at read time via the HasTranslations trait.
     */
    private array $tables = ['news', 'services', 'products', 'works', 'faqs', 'pages', 'banners'];

    public function up(): void
    {
        foreach ($this->tables as $table) {
            if (Schema::hasTable($table) && ! Schema::hasColumn($table, 'translations')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->json('translations')->nullable()->after('id');
                });
            }
        }
    }

    public function down(): void
    {
        foreach ($this->tables as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'translations')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->dropColumn('translations');
                });
            }
        }
    }
};
