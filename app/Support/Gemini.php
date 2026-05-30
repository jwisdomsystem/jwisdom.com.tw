<?php

namespace App\Support;

use App\Models\Setting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

/**
 * Gemini 文字生成，支援多把金鑰輪巡（round-robin）＋ 遇 429/錯誤自動換下一把。
 */
class Gemini
{
    /** 取得金鑰清單（後台 gemini_api_keys 一行一把；相容舊的單把 gemini_api_key / config）。 */
    public static function keys(): array
    {
        $multi = trim((string) Setting::get('gemini_api_keys'));
        $keys = $multi !== '' ? preg_split('/[\r\n,]+/', $multi) : [];
        $keys = array_values(array_unique(array_filter(array_map('trim', $keys))));

        if (empty($keys)) {
            $single = (string) (Setting::get('gemini_api_key') ?: config('insights.gemini_key'));
            if ($single !== '') {
                $keys = [trim($single)];
            }
        }

        return $keys;
    }

    public static function model(): string
    {
        return Setting::get('gemini_model') ?: config('insights.gemini_model', 'gemini-2.5-flash');
    }

    public static function hasKey(): bool
    {
        return ! empty(self::keys());
    }

    /** 逐一測試每把金鑰是否可用（送極小請求，幾乎不耗額度）。 */
    public static function testKeys(): array
    {
        $keys = self::keys();
        $model = self::model();
        $out = [];
        foreach ($keys as $i => $key) {
            $label = '#'.($i + 1).'（…'.substr($key, -4).'）';
            try {
                $res = Http::timeout(30)->post(
                    "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$key}",
                    ['contents' => [['parts' => [['text' => 'ping']]]], 'generationConfig' => ['maxOutputTokens' => 1]],
                );
                if ($res->ok()) {
                    $out[] = ['key' => $label, 'ok' => true, 'message' => '正常'];
                } else {
                    $st = $res->status();
                    $msg = $st === 429 ? '額度用完／限流 (429)' : ((string) data_get($res->json(), 'error.message', 'HTTP '.$st));
                    $out[] = ['key' => $label, 'ok' => false, 'message' => $msg];
                }
            } catch (\Throwable $e) {
                $out[] = ['key' => $label, 'ok' => false, 'message' => $e->getMessage()];
            }
        }

        return $out;
    }

    /**
     * 產生文字。會從游標位置開始輪巡所有金鑰，遇 429 或錯誤就換下一把。
     *
     * @return array{0: ?string, 1: int}  [text, status]（status=429 代表所有金鑰都被限流）
     */
    public static function generateText(string $prompt, array $generationConfig = [], int $timeout = 45): array
    {
        $keys = self::keys();
        if (empty($keys)) {
            return [null, 0];
        }

        $model = self::model();
        $n = count($keys);
        $start = ((int) Cache::get('gemini_key_cursor', 0)) % $n;
        $lastStatus = 0;

        for ($i = 0; $i < $n; $i++) {
            $idx = ($start + $i) % $n;
            $key = $keys[$idx];

            try {
                $res = Http::timeout($timeout)->post(
                    "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$key}",
                    [
                        'contents' => [['parts' => [['text' => $prompt]]]],
                        'generationConfig' => $generationConfig ?: ['temperature' => 0.7, 'maxOutputTokens' => 1024],
                    ],
                );
            } catch (\Throwable $e) {
                $lastStatus = 0;

                continue; // 連線錯誤 → 換下一把
            }

            $lastStatus = $res->status();

            if ($res->status() === 429 || ! $res->ok()) {
                continue; // 限流或其他錯誤 → 換下一把
            }

            // 成功 → 游標推進到下一把，分散負載
            Cache::put('gemini_key_cursor', ($idx + 1) % $n, now()->addDay());
            $text = (string) data_get($res->json(), 'candidates.0.content.parts.0.text', '');

            return [$text !== '' ? trim($text) : null, 200];
        }

        return [null, $lastStatus]; // 全部失敗（通常是全部 429）
    }
}
