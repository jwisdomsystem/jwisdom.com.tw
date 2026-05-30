<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $t) {
            $t->id();
            $t->string('key')->unique();
            $t->longText('value')->nullable();
            $t->string('group')->default('general');
            $t->timestamps();
        });

        Schema::create('banners', function (Blueprint $t) {
            $t->id();
            $t->string('zone')->index();            // announcement | carousel | promo | floating
            $t->string('title')->nullable();
            $t->string('subtitle')->nullable();
            $t->text('body')->nullable();
            $t->string('image')->nullable();
            $t->string('url')->nullable();
            $t->string('cta_label')->nullable();
            $t->string('accent')->nullable();        // tailwind gradient classes
            $t->unsignedInteger('sort')->default(0);
            $t->boolean('is_active')->default(true);
            $t->timestamp('starts_at')->nullable();
            $t->timestamp('ends_at')->nullable();
            $t->timestamps();
        });

        Schema::create('news', function (Blueprint $t) {
            $t->id();
            $t->string('title');
            $t->string('slug')->unique();
            $t->string('category')->nullable();
            $t->string('type')->default('news');     // news | insight
            $t->text('excerpt')->nullable();
            $t->longText('body')->nullable();
            $t->string('cover')->nullable();
            $t->string('cover_gradient')->nullable();
            $t->string('source_name')->nullable();
            $t->string('source_url')->nullable();
            $t->boolean('is_published')->default(true);
            $t->timestamp('published_at')->nullable();
            $t->string('meta_title')->nullable();
            $t->string('meta_description')->nullable();
            $t->timestamps();
            $t->index(['type', 'is_published', 'published_at']);
        });

        Schema::create('works', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('slug')->unique();
            $t->string('category')->nullable();
            $t->text('summary')->nullable();
            $t->longText('body')->nullable();
            $t->string('cover')->nullable();
            $t->string('cover_gradient')->nullable();
            $t->string('year')->nullable();
            $t->string('url')->nullable();
            $t->unsignedInteger('sort')->default(0);
            $t->boolean('is_published')->default(true);
            $t->timestamps();
        });

        Schema::create('services', function (Blueprint $t) {
            $t->id();
            $t->string('title');
            $t->string('slug')->unique();
            $t->text('summary')->nullable();
            $t->longText('body')->nullable();
            $t->string('icon')->nullable();          // icon key
            $t->string('icon_bg')->nullable();
            $t->string('icon_text')->nullable();
            $t->unsignedInteger('sort')->default(0);
            $t->boolean('is_published')->default(true);
            $t->timestamps();
        });

        Schema::create('faqs', function (Blueprint $t) {
            $t->id();
            $t->string('group')->default('一般');
            $t->string('question');
            $t->longText('answer');
            $t->unsignedInteger('sort')->default(0);
            $t->boolean('is_published')->default(true);
            $t->timestamps();
        });

        Schema::create('pages', function (Blueprint $t) {
            $t->id();
            $t->string('key')->unique();             // about | terms | privacy
            $t->string('title');
            $t->longText('body')->nullable();
            $t->string('meta_title')->nullable();
            $t->string('meta_description')->nullable();
            $t->timestamps();
        });

        if (! Schema::hasColumn('users', 'is_admin')) {
            Schema::table('users', function (Blueprint $t) {
                $t->boolean('is_admin')->default(false);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('pages');
        Schema::dropIfExists('faqs');
        Schema::dropIfExists('services');
        Schema::dropIfExists('works');
        Schema::dropIfExists('news');
        Schema::dropIfExists('banners');
        Schema::dropIfExists('settings');
        if (Schema::hasColumn('users', 'is_admin')) {
            Schema::table('users', function (Blueprint $t) {
                $t->dropColumn('is_admin');
            });
        }
    }
};
