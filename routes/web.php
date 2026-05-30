<?php

use App\Http\Controllers\ContactController;
use App\Http\Controllers\FaqController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\WorkController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [HomeController::class, 'index'])->name('home');

// SEO
Route::get('/sitemap.xml', [SitemapController::class, 'index']);
Route::get('/robots.txt', [SitemapController::class, 'robots']);

// 舊站 301 轉址
Route::permanentRedirect('/index.php', '/');
Route::permanentRedirect('/about.php', '/about');
Route::permanentRedirect('/news.php', '/news');
Route::permanentRedirect('/news-2.php', '/news');
// 舊版精選實例／合作夥伴／產品頁 → 對應新頁
Route::permanentRedirect('/cases', '/');
Route::permanentRedirect('/case', '/');
Route::permanentRedirect('/partners', '/');
Route::permanentRedirect('/partner', '/');
Route::get('/productmarket/{any?}', fn () => redirect('/', 301))->where('any', '.*');
Route::get('/gascom/{any?}', fn () => redirect('/', 301))->where('any', '.*');
// 舊版中文路徑：新聞詳情導到新聞列表，其餘導首頁
Route::get('/zh_tw/news_detail/{any?}', fn () => redirect('/news', 301))->where('any', '.*');
Route::get('/zh_tw/{any}', fn () => redirect('/', 301))->where('any', '.*');

Route::get('/news', [NewsController::class, 'index'])->name('news.index');
Route::get('/insights', [NewsController::class, 'insights'])->name('insights.index');
Route::get('/news/{news}', [NewsController::class, 'show'])->name('news.show');
Route::get('/services/{service}', [ServiceController::class, 'show'])->name('services.show');
Route::get('/works/{work}', [WorkController::class, 'show'])->name('works.show');
Route::get('/faq', [FaqController::class, 'index'])->name('faq');
Route::get('/contact', [ContactController::class, 'show'])->name('contact');
Route::post('/contact', [ContactController::class, 'store'])->name('contact.store');
Route::get('/about', [PageController::class, 'show'])->defaults('key', 'about')->name('about');
Route::get('/terms', [PageController::class, 'show'])->defaults('key', 'terms')->name('terms');
Route::get('/privacy', [PageController::class, 'show'])->defaults('key', 'privacy')->name('privacy');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', fn () => redirect('/admin'))->name('dashboard');
});

// ===== 後台 =====
// 注意：News/Work/Service model 的 getRouteKeyName() 為 slug（前台需要漂亮網址），
// 後台一律以 {model:id} 綁定，避免用 id 連結卻被當成 slug 找不到資料而出錯。
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [\App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('dashboard');
    Route::get('/analytics', [\App\Http\Controllers\Admin\AnalyticsController::class, 'index'])->name('analytics');

    Route::get('/contacts', [\App\Http\Controllers\Admin\ContactController::class, 'index'])->name('contacts.index');
    Route::patch('/contacts/{contact}/read', [\App\Http\Controllers\Admin\ContactController::class, 'markRead'])->name('contacts.read');
    Route::delete('/contacts/{contact}', [\App\Http\Controllers\Admin\ContactController::class, 'destroy'])->name('contacts.destroy');

    // 最新消息（type=news）
    Route::get('news', [\App\Http\Controllers\Admin\NewsController::class, 'index'])->name('news.index');
    Route::get('news/create', [\App\Http\Controllers\Admin\NewsController::class, 'create'])->name('news.create');
    Route::post('news', [\App\Http\Controllers\Admin\NewsController::class, 'store'])->name('news.store');
    Route::get('news/{news:id}/edit', [\App\Http\Controllers\Admin\NewsController::class, 'edit'])->name('news.edit');
    Route::put('news/{news:id}', [\App\Http\Controllers\Admin\NewsController::class, 'update'])->name('news.update');
    Route::patch('news/{news:id}/toggle', [\App\Http\Controllers\Admin\NewsController::class, 'toggle'])->name('news.toggle');
    Route::post('news/{news:id}/duplicate', [\App\Http\Controllers\Admin\NewsController::class, 'duplicate'])->name('news.duplicate');
    Route::delete('news/{news:id}', [\App\Http\Controllers\Admin\NewsController::class, 'destroy'])->name('news.destroy');

    // 技術洞察（type=insight）
    Route::get('insights', [\App\Http\Controllers\Admin\InsightController::class, 'index'])->name('insights.index');
    Route::get('insights/create', [\App\Http\Controllers\Admin\InsightController::class, 'create'])->name('insights.create');
    Route::post('insights', [\App\Http\Controllers\Admin\InsightController::class, 'store'])->name('insights.store');
    Route::get('insights/{insight:id}/edit', [\App\Http\Controllers\Admin\InsightController::class, 'edit'])->name('insights.edit');
    Route::put('insights/{insight:id}', [\App\Http\Controllers\Admin\InsightController::class, 'update'])->name('insights.update');
    Route::patch('insights/{insight:id}/toggle', [\App\Http\Controllers\Admin\InsightController::class, 'toggle'])->name('insights.toggle');
    Route::post('insights/{insight:id}/duplicate', [\App\Http\Controllers\Admin\InsightController::class, 'duplicate'])->name('insights.duplicate');
    Route::delete('insights/{insight:id}', [\App\Http\Controllers\Admin\InsightController::class, 'destroy'])->name('insights.destroy');

    // AI 文案產生（摘要 + 內文）
    Route::post('ai/generate', [\App\Http\Controllers\Admin\AiContentController::class, 'generate'])->name('ai.generate');
    Route::post('ai/generate-image', [\App\Http\Controllers\Admin\AiContentController::class, 'generateImage'])->name('ai.generate-image');
    Route::post('ai/headlines', [\App\Http\Controllers\Admin\AiContentController::class, 'headlines'])->name('ai.headlines');

    // 圖片上傳
    Route::post('uploads/image', [\App\Http\Controllers\Admin\UploadController::class, 'image'])->name('uploads.image');

    Route::resource('banners', \App\Http\Controllers\Admin\BannerController::class)->except(['show']);
    Route::patch('banners/{banner}/toggle', [\App\Http\Controllers\Admin\BannerController::class, 'toggle'])->name('banners.toggle');

    // 策略夥伴 Logo
    Route::get('partners', [\App\Http\Controllers\Admin\PartnerController::class, 'index'])->name('partners.index');
    Route::get('partners/create', [\App\Http\Controllers\Admin\PartnerController::class, 'create'])->name('partners.create');
    Route::post('partners', [\App\Http\Controllers\Admin\PartnerController::class, 'store'])->name('partners.store');
    Route::get('partners/{partner}/edit', [\App\Http\Controllers\Admin\PartnerController::class, 'edit'])->name('partners.edit');
    Route::put('partners/{partner}', [\App\Http\Controllers\Admin\PartnerController::class, 'update'])->name('partners.update');
    Route::patch('partners/{partner}/toggle', [\App\Http\Controllers\Admin\PartnerController::class, 'toggle'])->name('partners.toggle');
    Route::delete('partners/{partner}', [\App\Http\Controllers\Admin\PartnerController::class, 'destroy'])->name('partners.destroy');

    // 我們的產品
    Route::get('products', [\App\Http\Controllers\Admin\ProductController::class, 'index'])->name('products.index');
    Route::get('products/create', [\App\Http\Controllers\Admin\ProductController::class, 'create'])->name('products.create');
    Route::post('products', [\App\Http\Controllers\Admin\ProductController::class, 'store'])->name('products.store');
    Route::get('products/{product}/edit', [\App\Http\Controllers\Admin\ProductController::class, 'edit'])->name('products.edit');
    Route::put('products/{product}', [\App\Http\Controllers\Admin\ProductController::class, 'update'])->name('products.update');
    Route::patch('products/{product}/toggle', [\App\Http\Controllers\Admin\ProductController::class, 'toggle'])->name('products.toggle');
    Route::delete('products/{product}', [\App\Http\Controllers\Admin\ProductController::class, 'destroy'])->name('products.destroy');

    // 精選實例（Work model 綁定 slug → 後台用 id）
    Route::get('works', [\App\Http\Controllers\Admin\WorkController::class, 'index'])->name('works.index');
    Route::get('works/create', [\App\Http\Controllers\Admin\WorkController::class, 'create'])->name('works.create');
    Route::post('works', [\App\Http\Controllers\Admin\WorkController::class, 'store'])->name('works.store');
    Route::get('works/{work:id}/edit', [\App\Http\Controllers\Admin\WorkController::class, 'edit'])->name('works.edit');
    Route::put('works/{work:id}', [\App\Http\Controllers\Admin\WorkController::class, 'update'])->name('works.update');
    Route::patch('works/{work:id}/toggle', [\App\Http\Controllers\Admin\WorkController::class, 'toggle'])->name('works.toggle');
    Route::delete('works/{work:id}', [\App\Http\Controllers\Admin\WorkController::class, 'destroy'])->name('works.destroy');

    // 服務項目（Service model 綁定 slug → 後台用 id）
    Route::get('services', [\App\Http\Controllers\Admin\ServiceController::class, 'index'])->name('services.index');
    Route::get('services/create', [\App\Http\Controllers\Admin\ServiceController::class, 'create'])->name('services.create');
    Route::post('services', [\App\Http\Controllers\Admin\ServiceController::class, 'store'])->name('services.store');
    Route::get('services/{service:id}/edit', [\App\Http\Controllers\Admin\ServiceController::class, 'edit'])->name('services.edit');
    Route::put('services/{service:id}', [\App\Http\Controllers\Admin\ServiceController::class, 'update'])->name('services.update');
    Route::patch('services/{service:id}/toggle', [\App\Http\Controllers\Admin\ServiceController::class, 'toggle'])->name('services.toggle');
    Route::delete('services/{service:id}', [\App\Http\Controllers\Admin\ServiceController::class, 'destroy'])->name('services.destroy');

    Route::resource('faqs', \App\Http\Controllers\Admin\FaqController::class)->except(['show']);
    Route::patch('faqs/{faq}/toggle', [\App\Http\Controllers\Admin\FaqController::class, 'toggle'])->name('faqs.toggle');
    Route::get('/home-content', [\App\Http\Controllers\Admin\HomeContentController::class, 'edit'])->name('home-content.edit');
    Route::put('/home-content', [\App\Http\Controllers\Admin\HomeContentController::class, 'update'])->name('home-content.update');

    Route::get('/pages', [\App\Http\Controllers\Admin\PageController::class, 'index'])->name('pages.index');
    Route::get('/pages/{page}/edit', [\App\Http\Controllers\Admin\PageController::class, 'edit'])->name('pages.edit');
    Route::put('/pages/{page}', [\App\Http\Controllers\Admin\PageController::class, 'update'])->name('pages.update');

    Route::get('/settings', [\App\Http\Controllers\Admin\SettingController::class, 'edit'])->name('settings.edit');
    Route::put('/settings', [\App\Http\Controllers\Admin\SettingController::class, 'update'])->name('settings.update');

    Route::get('/integrations', [\App\Http\Controllers\Admin\IntegrationController::class, 'edit'])->name('integrations.edit');
    Route::put('/integrations', [\App\Http\Controllers\Admin\IntegrationController::class, 'update'])->name('integrations.update');
    Route::post('/integrations/fetch', [\App\Http\Controllers\Admin\IntegrationController::class, 'fetchInsights'])->name('integrations.fetch');
    Route::get('/integrations/test', [\App\Http\Controllers\Admin\IntegrationController::class, 'testKeys'])->name('integrations.test');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
