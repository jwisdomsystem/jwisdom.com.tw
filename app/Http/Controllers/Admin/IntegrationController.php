<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Support\Gemini;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class IntegrationController extends Controller
{
    public function edit(): Response
    {
        $keys = (string) (Setting::get('gemini_api_keys') ?: Setting::get('gemini_api_key') ?: '');
        $first = trim((string) (preg_split('/[\r\n,]+/', $keys)[0] ?? ''));

        return Inertia::render('admin/integrations', [
            'gemini_api_keys' => $keys,
            'gemini_model' => Setting::get('gemini_model') ?: 'gemini-2.5-flash',
            'gemini_models' => $this->availableModels($first),
            'insights_daily_count' => (string) (Setting::get('insights_daily_count') ?: '2'),
            'cf_account_id' => (string) (Setting::get('cf_account_id') ?: ''),
            'cf_api_token' => (string) (Setting::get('cf_api_token') ?: ''),
            'cf_image_model' => Setting::get('cf_image_model') ?: '@cf/black-forest-labs/flux-1-schnell',
            'turnstile_site_key' => (string) (Setting::get('turnstile_site_key') ?: ''),
            'turnstile_secret_key' => (string) (Setting::get('turnstile_secret_key') ?: ''),
        ]);
    }

    /**
     * 動態取得 Gemini 可用模型（每日快取刷新；失敗用內建清單備援）。
     */
    private function availableModels(string $key): array
    {
        $fallback = [
            'gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash',
            'gemini-2.0-flash-lite', 'gemini-1.5-pro', 'gemini-1.5-flash',
        ];

        if (! $key) {
            return $fallback;
        }

        return Cache::remember('gemini_models_'.md5($key), 86400, function () use ($key, $fallback) {
            try {
                $res = Http::timeout(10)->get('https://generativelanguage.googleapis.com/v1beta/models', ['key' => $key]);
                if (! $res->ok()) {
                    return $fallback;
                }
                $models = collect($res->json('models', []))
                    ->filter(fn ($m) => in_array('generateContent', $m['supportedGenerationMethods'] ?? [], true))
                    ->map(fn ($m) => str_replace('models/', '', $m['name'] ?? ''))
                    ->filter(fn ($n) => str_starts_with($n, 'gemini'))
                    ->unique()->values()->all();

                return $models ?: $fallback;
            } catch (\Throwable $e) {
                return $fallback;
            }
        });
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'gemini_api_keys' => ['nullable', 'string', 'max:2000'],
            'gemini_model' => ['nullable', 'string', 'max:50'],
            'insights_daily_count' => ['nullable', 'integer', 'min:1', 'max:3'],
            'cf_account_id' => ['nullable', 'string', 'max:64'],
            'cf_api_token' => ['nullable', 'string', 'max:200'],
            'cf_image_model' => ['nullable', 'string', 'max:120'],
            'turnstile_site_key' => ['nullable', 'string', 'max:120'],
            'turnstile_secret_key' => ['nullable', 'string', 'max:120'],
        ]);

        // 整理多把金鑰（一行一把，去重去空白）
        $keys = array_values(array_unique(array_filter(array_map('trim', preg_split('/[\r\n,]+/', (string) ($data['gemini_api_keys'] ?? ''))))));
        $keysStr = implode("\n", $keys);
        $first = $keys[0] ?? '';

        Setting::set('gemini_api_keys', $keysStr);
        Setting::set('gemini_api_key', $first); // 相容：第一把作為單把 fallback
        Setting::set('gemini_model', $data['gemini_model'] ?: 'gemini-2.5-flash');
        Setting::set('insights_daily_count', (string) ($data['insights_daily_count'] ?? 2));

        Setting::set('cf_account_id', trim((string) ($data['cf_account_id'] ?? '')));
        Setting::set('cf_api_token', trim((string) ($data['cf_api_token'] ?? '')));
        Setting::set('cf_image_model', $data['cf_image_model'] ?: '@cf/black-forest-labs/flux-1-schnell');

        Setting::set('turnstile_site_key', trim((string) ($data['turnstile_site_key'] ?? '')));
        Setting::set('turnstile_secret_key', trim((string) ($data['turnstile_secret_key'] ?? '')));

        // 清模型快取，讓清單依新金鑰即時刷新
        if ($first) {
            Cache::forget('gemini_models_'.md5($first));
        }

        return back()->with('success', '已儲存整合設定（共 '.count($keys).' 把金鑰）');
    }

    /** 逐把測試已儲存的 Gemini 金鑰是否可用（送極小請求）。 */
    public function testKeys(): JsonResponse
    {
        $keys = Gemini::keys();
        $model = Gemini::model();
        $results = [];

        foreach ($keys as $k) {
            $masked = mb_substr($k, 0, 8).'…'.mb_substr($k, -4);
            try {
                $res = Http::timeout(20)->post(
                    "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$k}",
                    [
                        'contents' => [['parts' => [['text' => 'ping']]]],
                        'generationConfig' => ['maxOutputTokens' => 1, 'thinkingConfig' => ['thinkingBudget' => 0]],
                    ],
                );
                if ($res->ok()) {
                    $results[] = ['key' => $masked, 'ok' => true, 'message' => '可用'];
                } elseif ($res->status() === 429) {
                    $results[] = ['key' => $masked, 'ok' => false, 'message' => '配額/速率限制（429）'];
                } else {
                    $msg = (string) (data_get($res->json(), 'error.message') ?: ('HTTP '.$res->status()));
                    $results[] = ['key' => $masked, 'ok' => false, 'message' => mb_substr($msg, 0, 60)];
                }
            } catch (\Throwable $e) {
                $results[] = ['key' => $masked, 'ok' => false, 'message' => '連線失敗'];
            }
        }

        return response()->json(['results' => $results]);
    }

    public function fetchInsights(): RedirectResponse
    {
        Artisan::call('insights:fetch', ['--count' => 1]);
        $out = trim(Artisan::output());

        return back()->with('success', '抓取結果：'.($out !== '' ? $out : '完成'));
    }
}
