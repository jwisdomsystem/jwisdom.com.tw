<?php

namespace Tests\Feature;

use App\Models\News;
use App\Models\Service;
use App\Models\User;
use App\Models\Work;
use Database\Seeders\SiteContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SiteTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(SiteContentSeeder::class);
    }

    public function test_home_loads(): void
    {
        $this->get('/')->assertStatus(200);
    }

    public function test_public_pages_load(): void
    {
        foreach (['/news', '/faq', '/about', '/terms', '/privacy', '/contact'] as $url) {
            $this->get($url)->assertStatus(200);
        }
    }

    public function test_detail_pages_load(): void
    {
        $this->get('/services/'.Service::first()->slug)->assertStatus(200);
        $this->get('/works/'.Work::first()->slug)->assertStatus(200);
        $this->get('/news/'.News::first()->slug)->assertStatus(200);
    }

    public function test_sitemap_and_robots(): void
    {
        $this->get('/sitemap.xml')->assertStatus(200)->assertHeader('Content-Type', 'application/xml');
        $this->get('/robots.txt')->assertStatus(200);
    }

    public function test_unknown_page_returns_404(): void
    {
        $this->get('/no-such-page-xyz')->assertStatus(404);
    }

    public function test_contact_form_stores_to_database(): void
    {
        $this->post('/contact', [
            'name' => '測試用戶', 'email' => 'tester@example.com', 'message' => '需求測試內容',
        ])->assertRedirect();
        $this->assertDatabaseHas('contacts', ['email' => 'tester@example.com']);
    }

    public function test_admin_requires_authentication(): void
    {
        $this->get('/admin')->assertRedirect('/login');
    }

    public function test_non_admin_is_forbidden(): void
    {
        $user = User::factory()->create(['is_admin' => false]);
        $this->actingAs($user)->get('/admin')->assertStatus(403);
    }

    public function test_admin_can_access_dashboard(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $this->actingAs($admin)->get('/admin')->assertStatus(200);
    }

    public function test_admin_can_create_news(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $this->actingAs($admin)->post('/admin/news', [
            'title' => '自動測試新聞', 'type' => 'news', 'is_published' => true,
        ])->assertRedirect();
        $this->assertDatabaseHas('news', ['title' => '自動測試新聞']);
    }

    public function test_admin_can_update_settings(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $this->actingAs($admin)->put('/admin/settings', [
            'settings' => ['contact_phone' => '06-2340161'],
        ])->assertRedirect();
        $this->assertSame('06-2340161', \App\Models\Setting::get('contact_phone'));
    }
}
