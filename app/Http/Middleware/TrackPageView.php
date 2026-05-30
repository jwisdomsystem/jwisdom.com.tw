<?php

namespace App\Http\Middleware;

use App\Models\PageView;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class TrackPageView
{
    /** 機器人／非瀏覽器 User-Agent 關鍵字（小寫比對） */
    private const BOT_PATTERNS = [
        'bot', 'crawl', 'spider', 'slurp', 'curl', 'wget', 'python', 'headless',
        'facebookexternal', 'embedly', 'preview', 'monitor', 'pingdom', 'uptime',
        'go-http', 'okhttp', 'axios', 'java/', 'libwww', 'httpx', 'http-client',
        'lighthouse', 'gtmetrix', 'phantom', 'scrapy', 'semrush', 'ahrefs', 'mj12',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        try {
            $ua = (string) $request->userAgent();
            $isBot = $ua === ''
                || ! Str::contains($ua, 'Mozilla')                       // 真實瀏覽器都含 Mozilla
                || Str::contains(Str::lower($ua), self::BOT_PATTERNS);    // 已知 bot / curl / 監控

            if ($request->isMethod('GET') && $response->getStatusCode() === 200 && ! $isBot && ! $request->user()) {
                $path = '/'.ltrim($request->path(), '/');
                $skip = str_starts_with($path, '/admin')
                    || str_starts_with($path, '/build')
                    || str_starts_with($path, '/storage')
                    || str_starts_with($path, '/login')
                    || str_starts_with($path, '/register')
                    || str_starts_with($path, '/dashboard')
                    || $path === '/up'
                    || str_contains($path, '.'); // sitemap.xml/robots.txt/檔案

                if (! $skip) {
                    PageView::create([
                        'path' => Str::limit($path, 191, ''),
                        'referrer' => Str::limit((string) $request->headers->get('referer'), 191, ''),
                        'ip' => $request->ip(),
                        'user_agent' => Str::limit($ua, 255, ''),
                        'created_at' => now(),
                    ]);
                }
            }
        } catch (\Throwable $e) {
            // 追蹤失敗不影響頁面
        }

        return $response;
    }
}
