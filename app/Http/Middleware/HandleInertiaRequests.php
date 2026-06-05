<?php

namespace App\Http\Middleware;

use App\Models\Banner;
use App\Models\Partner;
use App\Models\Product;
use App\Models\Service;
use App\Models\Setting;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Supported front-end locales. Keep in sync with resources/js/i18n/index.ts.
     */
    public const SUPPORTED_LOCALES = ['zh-TW', 'en'];

    public const DEFAULT_LOCALE = 'zh-TW';

    public function resolveLocale(Request $request): string
    {
        $locale = $request->cookie('locale');

        return in_array($locale, self::SUPPORTED_LOCALES, true)
            ? $locale
            : self::DEFAULT_LOCALE;
    }

    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $locale = $this->resolveLocale($request);
        app()->setLocale($locale);

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'locale' => $locale,
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'settings' => fn () => Setting::pluck('value', 'key'),
            'banners' => fn () => Banner::active()->orderBy('sort')->get([
                'translations', 'zone', 'title', 'subtitle', 'body', 'image', 'url', 'cta_label', 'accent',
            ])->groupBy('zone'),
            // 全站共享（首頁產品區 + footer 用）
            'siteProducts' => fn () => Product::active()->orderBy('sort')->get([
                'translations', 'name', 'en', 'tag', 'description', 'url', 'features', 'accent',
            ]),
            'footerServices' => fn () => Service::where('is_published', true)->orderBy('sort')->take(6)->get(['translations', 'title', 'slug']),
            'sitePartners' => fn () => Partner::active()->orderBy('sort')->orderBy('id')->get(['name', 'logo', 'url']),
            'ziggy' => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
        ];
    }
}
