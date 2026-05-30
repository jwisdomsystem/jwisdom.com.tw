<?php

namespace App\Console\Commands;

use App\Models\News;
use App\Models\Setting;
use App\Support\Gemini;
use App\Support\Img;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FetchInsights extends Command
{
    protected $signature = 'insights:fetch {--count= : 本次產生幾則}';

    protected $description = '從產業新聞來源抓取，用 Gemini 生成完整繁中技術洞察（摘要+內文+分類）並用 Cloudflare 生封面圖，存為 News(type=insight)';

    private const CATEGORIES = ['AI 應用', '資訊安全', '系統架構', '雲端與 DevOps', '資料與分析', '產業新聞'];

    public function handle(): int
    {
        if (! Gemini::hasKey()) {
            $this->error('未設定 Gemini 金鑰（請至後台「整合設定」填入）。');

            return self::FAILURE;
        }

        $count = (int) ($this->option('count') ?: (Setting::get('insights_daily_count') ?: config('insights.daily_count', 2)));

        $items = [];
        foreach (config('insights.feeds', []) as $feed) {
            try {
                $res = Http::timeout(15)->get($feed);
                if (! $res->ok()) {
                    continue;
                }
                $xml = @simplexml_load_string($res->body());
                if (! $xml || ! isset($xml->channel->item)) {
                    continue;
                }
                foreach ($xml->channel->item as $it) {
                    $title = trim((string) $it->title);
                    $link = trim((string) $it->link);
                    // Google News 的標題格式為「標題 - 媒體名稱」，且通常帶 <source> 節點
                    $source = trim((string) $it->source);
                    if ($source === '' && preg_match('/^(.*)\s[-–]\s([^-–]+)$/u', $title, $m)) {
                        $source = trim($m[2]);
                    }
                    // 把標題尾端的「 - 媒體名稱」清掉，讓標題乾淨一致
                    if ($source !== '') {
                        $title = trim((string) preg_replace('/\s*[-–]\s*'.preg_quote($source, '/').'\s*$/u', '', $title));
                    }
                    if ($title && $link) {
                        $items[] = ['title' => $title, 'link' => $link, 'source' => $source];
                    }
                }
            } catch (\Throwable $e) {
                $this->warn('feed error: '.$e->getMessage());
            }
        }

        if (empty($items)) {
            $this->error('沒有抓到任何新聞項目。');

            return self::FAILURE;
        }

        shuffle($items);
        $created = 0;
        $attempts = 0;
        $maxAttempts = max($count * 3, 6);

        foreach ($items as $item) {
            if ($created >= $count || $attempts >= $maxAttempts) {
                break;
            }
            if (News::where('source_url', $item['link'])->orWhere('title', $item['title'])->exists()) {
                continue;
            }

            $attempts++;
            [$article, $status] = $this->generate($item['title']);

            if ($status === 429) {
                $this->error('Gemini 配額或速率限制（429）。請稍後再試，或改用其他模型。');

                return self::FAILURE;
            }
            if (! $article) {
                usleep(500000);

                continue;
            }

            $grads = config('insights.gradients', ['from-slate-700 to-slate-900']);
            $cover = $this->coverImage($item['title']);
            // 內文中段再插一張 AI 示意圖（與封面不同），讓文章不單調
            $inline = $this->coverImage($item['title']);
            $body = $inline ? $this->insertInlineImage($article['body'], $inline, $item['title']) : $article['body'];

            News::create([
                'title' => Str::limit($item['title'], 180, ''),
                'slug' => 'insight-'.now()->format('YmdHis').'-'.Str::lower(Str::random(4)),
                'category' => $article['category'],
                'type' => 'insight',
                'excerpt' => $article['excerpt'],
                'body' => $body,
                'cover' => $cover,
                'source_name' => $item['source'] ?: '產業新聞',
                'source_url' => $item['link'],
                'cover_gradient' => $grads[array_rand($grads)],
                'is_published' => true,
                'published_at' => now(),
                'meta_description' => $article['meta_description'] ?: $article['excerpt'],
            ]);
            $created++;
            $this->info('已建立洞察：'.$item['title'].($cover ? '（含封面圖）' : '（無封面，CF 未設定或失敗）'));
            usleep(900000);
        }

        $this->info("完成，本次新增 {$created} 則技術洞察。");

        return self::SUCCESS;
    }

    /**
     * 用 Gemini 產生完整文章：分類 + 摘要 + 多段 HTML 內文。
     *
     * @return array{0: ?array{category:string,excerpt:string,body:string}, 1: int}
     */
    private function generate(string $title): array
    {
        $cats = implode('、', self::CATEGORIES);
        $rules = \App\Http\Controllers\Admin\AiContentController::qualityRules();
        $prompt = <<<PROMPT
你是宸揚資科（軟體開發與 AIoT 系統整合公司）的技術編輯，同時具備績效廣告文案的寫作思維。
請根據以下新聞標題，用繁體中文撰寫一篇圖文並茂、結構豐富的「技術洞察」文章，聚焦技術趨勢與商業意義。

{$rules}

請只輸出 JSON 物件（不要 markdown 圍欄），body 為 HTML，需符合：
- 600-900 字
- 開頭一段導言 <p>（**第一句必須有鉤子**：反直覺結論、具體痛點、或關鍵數據）
- 2-3 個 <h3> 小標分段，每段下方 <p> 說明
- 至少一個 <ul><li> 重點清單
- **務必包含一個 <table>**（含 <thead><tr><th>…</th></tr></thead> 與 <tbody>），例如「技術/方案比較表」或「導入效益對照表」，3-4 列
- 結尾一段總結 <p>，要有可帶走的 takeaway
JSON 格式：{"category":"從這些擇一：{$cats}","excerpt":"80-120字摘要，要有 takeaway、避免行銷套話","body":"<p>…</p><h3>…</h3>…<table>…</table>…","meta_description":"80-120字SEO描述，像優秀廣告文案，凝鍊呈現核心觀點與關鍵字，能吸引點擊"}

新聞標題：{$title}
PROMPT;

        try {
            // 多把金鑰輪巡（遇 429 自動換下一把）
            [$text, $status] = Gemini::generateText($prompt, [
                'temperature' => 0.7,
                'maxOutputTokens' => 3000,
                'responseMimeType' => 'application/json',
                'thinkingConfig' => ['thinkingBudget' => 0],
            ]);
            if ($status === 429) {
                return [null, 429];
            }
            $parsed = json_decode((string) $text, true);
            if (! is_array($parsed) || empty($parsed['body'])) {
                return [null, $status ?: 200];
            }

            $category = in_array($parsed['category'] ?? '', self::CATEGORIES, true) ? $parsed['category'] : '產業新聞';

            return [[
                'category' => $category,
                'excerpt' => Str::limit(trim((string) ($parsed['excerpt'] ?? '')), 200, ''),
                'body' => trim((string) $parsed['body']),
                'meta_description' => Str::limit(trim((string) ($parsed['meta_description'] ?? '')), 300, ''),
            ], 200];
        } catch (\Throwable $e) {
            $this->warn('Gemini 例外：'.$e->getMessage());

            return [null, 0];
        }
    }

    /** 把一張 AI 圖插到內文第一段之後，讓文章圖文並茂。 */
    private function insertInlineImage(string $body, string $url, string $title): string
    {
        $fig = '<figure><img src="'.e($url).'" alt="'.e(Str::limit($title, 60, '')).' 示意圖" loading="lazy"></figure>';
        $pos = stripos($body, '</p>');
        if ($pos === false) {
            return $body.$fig;
        }
        $pos += 4;

        return substr($body, 0, $pos).$fig.substr($body, $pos);
    }

    /**
     * 用 Cloudflare Workers AI 依標題生封面圖，存到 storage/public，回傳網址（未設定或失敗回 null）。
     */
    private function coverImage(string $title): ?string
    {
        $account = trim((string) Setting::get('cf_account_id'));
        $token = trim((string) Setting::get('cf_api_token'));
        if (! $account || ! $token) {
            return null;
        }

        $model = Setting::get('cf_image_model') ?: '@cf/black-forest-labs/flux-1-schnell';

        // 純抽象、無文字/無介面風格（避免模型亂塗假文字），隨機配色/seed
        $styles = [
            'abstract 3D render', 'flat geometric illustration', 'low-poly abstract',
            'abstract gradient mesh', 'isometric abstract shapes', 'minimal geometric art',
            'fluid abstract waves', 'particle network abstract',
        ];
        $palettes = [
            'blue and cyan tones', 'purple and magenta tones', 'teal and emerald tones',
            'orange and amber sunset tones', 'deep indigo and violet tones', 'slate grey and electric blue tones',
            'warm coral and pink tones', 'green and lime tech tones',
        ];
        $scene = $this->scene($title);
        $prompt = $scene.', '.$styles[array_rand($styles)].', '.$palettes[array_rand($palettes)]
            .', purely abstract technology cover, clean composition, high quality. '
            .'No screens, no monitors, no UI, no dashboards, no charts, no signage. '
            .'Absolutely no text, no letters, no numbers, no words, no chinese characters, no captions, no watermark, no logo.';

        $payload = ['prompt' => $prompt, 'seed' => random_int(1, 2000000000)];
        if (str_contains($model, 'flux')) {
            $payload['steps'] = 8;
        } else {
            $payload['num_steps'] = 20;
            $payload['negative_prompt'] = 'text, words, letters, numbers, chinese characters, captions, labels, screen, monitor, ui, dashboard, watermark, logo, low quality, blurry';
        }

        try {
            $res = Http::timeout(60)->withToken($token)
                ->post("https://api.cloudflare.com/client/v4/accounts/{$account}/ai/run/{$model}", $payload);
            if (! $res->ok()) {
                return null;
            }
            $b64 = data_get($res->json(), 'result.image');
            $binary = $b64 ? base64_decode($b64, true) : null;
            if (! $binary && str_starts_with((string) $res->header('Content-Type'), 'image/')) {
                $binary = $res->body();
            }
            if (! $binary) {
                return null;
            }
            [$out, $ext] = Img::webp($binary);
            $path = 'covers/ai-'.now()->format('YmdHis').'-'.Str::lower(Str::random(5)).'.'.$ext;
            if (! Storage::disk('public')->put($path, $out)) {
                $this->warn('封面圖寫檔失敗（檢查 storage/app/public/covers 權限）。');

                return null;
            }

            return Storage::disk('public')->url($path);
        } catch (\Throwable $e) {
            return null;
        }
    }

    /**
     * 用 Gemini 把中文標題轉成一段英文視覺場景關鍵字（不含任何文字元素）；失敗則用通用備援。
     */
    private function scene(string $title): string
    {
        $fallback = 'Abstract technology and AIoT concept, glowing circuit lines, futuristic data flow';
        if (! Gemini::hasKey()) {
            return $fallback;
        }
        $prompt = "Convert this Chinese article title into a concise ENGLISH text-to-image prompt describing ONLY an abstract technology mood (colours, shapes, light, composition). Strictly NO screens, NO monitors, NO UI, NO dashboards, NO text/letters/words/numbers. Output one line of comma-separated English keywords, no quotes.\n\nTitle: {$title}";
        [$t] = Gemini::generateText($prompt, ['temperature' => 0.9, 'maxOutputTokens' => 256, 'thinkingConfig' => ['thinkingBudget' => 0]], 20);

        return $t ? rtrim($t, " .") : $fallback;
    }
}
