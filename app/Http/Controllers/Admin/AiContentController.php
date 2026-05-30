<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Support\Gemini;
use App\Support\Img;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AiContentController extends Controller
{
    public function generate(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:300'],
            'kind' => ['required', 'in:news,insight,work,service,faq,product,page'],
        ]);

        if (! Gemini::hasKey()) {
            return response()->json(['message' => '尚未設定 Gemini 金鑰，請先到「整合設定 (AI)」填入。'], 422);
        }

        $subject = $data['title'];

        // 各類型的任務描述、輸入名稱、要求輸出的 JSON 欄位
        $spec = [
            'news' => ['以下標題的公司最新消息／動態稿', '標題', '{"excerpt":"60-100字摘要","body":"HTML內文 500-800字，含導言<p>、2-3個<h3>小標、<ul><li>重點清單、以及一個<table>(thead+tbody，例如重點整理表)，結尾總結<p>","meta_description":"80-120字SEO描述，包含關鍵字、簡潔有吸引力"}'],
            'insight' => ['以下標題的技術洞察短文（聚焦技術趨勢與商業意義）', '標題', '{"excerpt":"60-100字摘要","body":"HTML內文 600-900字，含導言<p>、2-3個<h3>小標、<ul><li>重點清單、以及一個<table>(thead+tbody，例如技術比較或效益對照表)，結尾總結<p>","meta_description":"80-120字SEO描述，包含關鍵字、簡潔有吸引力"}'],
            'work' => ['以下案例名稱的「精選實例／專案介紹」', '案例名稱', '{"summary":"60-100字專案摘要","body":"HTML內文，含專案背景、解決方案、成果，含<h3>小標、<ul>，以及一個<table>(專案重點或成效對照)","meta_description":"80-120字SEO描述，凸顯客戶產業、解決問題與成果，含關鍵字"}'],
            'service' => ['以下服務名稱的「服務項目介紹」', '服務名稱', '{"summary":"60-100字服務摘要","body":"HTML內文，含服務內容、適用情境、效益，含<h3>小標、<ul>，以及一個<table>(方案或效益對照表)","meta_description":"80-120字SEO描述，凸顯服務內容、適用對象與效益，含關鍵字"}'],
            'faq' => ['以下常見問題的「答案」', '問題', '{"answer":"HTML答案，1-3段<p>，清楚具體，可含<ul>"}'],
            'product' => ['以下產品的「產品介紹文案」', '產品名稱', '{"description":"80-150字產品介紹，吸引企業客戶","features":["亮點1","亮點2","亮點3"],"tag":"分類標籤，例如 AI 行銷 · SaaS"}'],
            'page' => ['以下企業官網頁面標題的完整頁面內容（依標題判斷是公司介紹／使用者條款／隱私權政策等，內容須符合台灣企業慣例、條款與隱私政策需涵蓋常見必要條目）', '頁面標題', '{"body":"完整HTML內容，分段<p>，適度使用<h2>/<h3>小標與<ul><li>","meta_description":"80-120字SEO描述"}'],
        ][$data['kind']];

        $rules = self::qualityRules();
        $prompt = <<<PROMPT
你是宸揚資科（軟體開發與 AIoT 系統整合公司）的內容編輯，同時具備「績效廣告文案」的寫作思維。
請根據{$spec[1]}，用繁體中文撰寫{$spec[0]}。

{$rules}

請只輸出 JSON 物件，格式如下（不要加 markdown 圍欄）：
{$spec[2]}

{$spec[1]}：{$subject}
PROMPT;

        // 多把金鑰輪巡（遇 429 自動換下一把）
        [$text, $status] = Gemini::generateText($prompt, [
            'temperature' => 0.8,
            'maxOutputTokens' => 3000,
            'responseMimeType' => 'application/json',
            // gemini-2.5-* 為 thinking 模型，預設會耗用 output token 思考導致回空，關閉思考
            'thinkingConfig' => ['thinkingBudget' => 0],
        ]);

        if ($status === 429) {
            return response()->json(['message' => 'Gemini 配額用完或被限流：所有金鑰都暫時不能用，請等約 30 分鐘讓 per-minute 限額重置，或到「整合設定（AI）」新增更多金鑰。'], 429);
        }
        if ($text === null || $text === '') {
            return response()->json(['message' => 'Gemini 沒有回傳內容（多半是金鑰即將被限流、或內容被安全過濾擋下）。請稍等幾分鐘重試；若一直發生，到「整合設定（AI）」按「測試金鑰」確認狀態。'], 502);
        }

        $parsed = json_decode($text, true);

        $out = [];
        if (is_array($parsed)) {
            foreach (['excerpt', 'body', 'summary', 'answer', 'description', 'tag', 'meta_description'] as $f) {
                if (isset($parsed[$f]) && is_string($parsed[$f])) {
                    $out[$f] = trim($parsed[$f]);
                }
            }
            if (isset($parsed['features']) && is_array($parsed['features'])) {
                $out['features'] = array_values(array_filter(array_map(fn ($x) => trim((string) $x), $parsed['features']), fn ($x) => $x !== ''));
            }
        }

        if (empty(array_filter($out, fn ($v) => $v !== '' && $v !== []))) {
            // 萬一模型沒回 JSON，整段塞進該類型的主要欄位
            $primary = ['faq' => 'answer', 'product' => 'description'][$data['kind']] ?? 'body';
            $clean = trim($text);
            if ($clean === '') {
                return response()->json(['message' => 'Gemini 沒有回傳內容（金鑰將被限流或內容被安全過濾）。請稍等幾分鐘重試。'], 502);
            }
            $out = [$primary => '<p>'.nl2br(e($clean)).'</p>'];
        }

        return response()->json($out);
    }

    /**
     * 用 Cloudflare Workers AI（免費額度內，Flux）依標題生成封面圖，存到 storage/public 並回傳網址。
     */
    public function generateImage(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:300'],
            'kind' => ['required', 'in:news,insight,work,service'],
        ]);

        $account = trim((string) Setting::get('cf_account_id'));
        $token = trim((string) Setting::get('cf_api_token'));
        if (! $account || ! $token) {
            return response()->json(['message' => '尚未設定 Cloudflare 帳號，請先到「整合設定 (AI)」填入 Account ID 與 API Token。'], 422);
        }

        $model = Setting::get('cf_image_model') ?: '@cf/black-forest-labs/flux-1-schnell';

        // 擴散模型無法正確渲染中文，且若把中文標題塞進提示詞會被「畫」成亂碼。
        // 改用英文場景描述（盡量由 Gemini 依標題翻成視覺提示詞），並強制不要任何文字。
        $scene = $this->buildImageScene($data['title'], $data['kind']);
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
        $prompt = $scene.', '.$styles[array_rand($styles)].', '.$palettes[array_rand($palettes)]
            .', purely abstract technology cover, clean composition, high quality. '
            .'No screens, no monitors, no UI, no dashboards, no charts, no signage. '
            .'Absolutely no text, no letters, no numbers, no words, no chinese characters, no captions, no watermark, no logo, no typography.';

        // flux 用 steps（上限 8）；SDXL 用 num_steps + 支援 negative_prompt。seed 隨機讓每次結果不同
        $payload = ['prompt' => $prompt, 'seed' => random_int(1, 2000000000)];
        if (str_contains($model, 'flux')) {
            $payload['steps'] = 8;
        } else {
            $payload['num_steps'] = 20;
            $payload['negative_prompt'] = 'text, words, letters, numbers, chinese characters, captions, labels, screen, monitor, ui, dashboard, watermark, signature, logo, typography, deformed, low quality, blurry';
        }

        try {
            $res = Http::timeout(60)
                ->withToken($token)
                ->post("https://api.cloudflare.com/client/v4/accounts/{$account}/ai/run/{$model}", $payload);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Cloudflare 連線失敗：'.$e->getMessage()], 502);
        }

        if (! $res->ok()) {
            $msg = data_get($res->json(), 'errors.0.message') ?: "HTTP {$res->status()}";
            return response()->json(['message' => "Cloudflare 生圖失敗（{$msg}）。請確認 Token 具 Workers AI 權限、帳號額度未用罄。"], 502);
        }

        // flux-1-schnell 回傳 { result: { image: base64 } }
        $b64 = data_get($res->json(), 'result.image');
        $binary = $b64 ? base64_decode($b64, true) : null;

        // 部分模型直接回原始影像位元組（content-type image/*）
        if (! $binary && str_starts_with((string) $res->header('Content-Type'), 'image/')) {
            $binary = $res->body();
        }

        if (! $binary) {
            return response()->json(['message' => 'Cloudflare 沒有回傳圖片內容，請重試或更換模型。'], 502);
        }

        [$out, $ext] = Img::webp($binary);
        $path = 'covers/ai-'.now()->format('YmdHis').'-'.Str::lower(Str::random(5)).'.'.$ext;
        if (! Storage::disk('public')->put($path, $out)) {
            return response()->json(['message' => '圖片儲存失敗，請確認 storage/app/public/covers 目錄權限。'], 500);
        }

        return response()->json(['cover' => Storage::disk('public')->url($path)]);
    }

    /**
     * 將中文標題轉成一段英文的「視覺場景」提示詞（給生圖模型用，純英文、不含文字元素）。
     * 有 Gemini 金鑰時用 Gemini 翻譯，否則用依類型的通用備援。
     */
    private function buildImageScene(string $title, string $kind): string
    {
        if (Gemini::hasKey()) {
            $prompt = "Convert the following Chinese article title into a concise ENGLISH text-to-image prompt describing ONLY an abstract technology mood (colours, shapes, light, composition). Strictly NO screens, NO monitors, NO UI, NO dashboards, NO text/letters/words/numbers/signage. Output one line of comma-separated English keywords only, no quotes.\n\nTitle: {$title}";
            [$text] = Gemini::generateText($prompt, ['temperature' => 0.7, 'maxOutputTokens' => 256, 'thinkingConfig' => ['thinkingBudget' => 0]], 20);
            if ($text) {
                return rtrim($text, " .").'.';
            }
        }

        return $kind === 'insight'
            ? 'Abstract cybersecurity and data network concept, glowing circuit lines, futuristic data flow.'
            : 'Modern corporate digital transformation and technology concept, abstract geometric network.';
    }

    /**
     * 共用：套用「績效廣告文案」標準（從 ad-creative skill 提煉）。
     * 注入所有 AI 文案 prompt，提升點擊吸引力與資訊密度。
     */
    public static function qualityRules(): string
    {
        return <<<RULES
**寫作品質要求（重要）：**
- **具體 > 抽象**：用數字、百分比、時間（如「節省 30% 維運成本」「3 個月導入」「8 成企業」），避免「大幅」「顯著」「快速」這類無資訊量的形容。
- **主動 > 被動**：用「協助企業提升 X」而非「X 得以被提升」。
- **成果 > 功能**：談「為企業帶來什麼結果」而非「我們提供什麼功能」。
- **第一句要有鉤子**：開頭句要勾住讀者繼續看（一個反直覺結論、一個具體痛點、一個關鍵數據），不要平鋪直敘。
- **摘要與 meta_description 要像優秀廣告文案**：簡潔有力、有明確 takeaway、避免行銷套話（嚴禁「業界領先」「最佳解決方案」「卓越品質」「優質服務」這類空話）。
- **內文要有「可帶走的東西」**：具體案例、可量化數據、可操作步驟、對照表——讀者看完要能講出 2-3 個重點。
- **語氣**：專業客觀，但不僵硬。面向企業經營者，要可信、有見地、易讀。
RULES;
    }

    /**
     * 多角度標題與摘要：依「ad-creative」測試思維，產出 3 種不同切入動機的版本。
     * 讓編輯者像挑廣告文案一樣，從中選最強的版本套用。
     */
    public function headlines(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:300'],
            'kind' => ['required', 'in:news,insight,work,service'],
        ]);

        if (! Gemini::hasKey()) {
            return response()->json(['message' => '尚未設定 Gemini 金鑰，請先到「整合設定 (AI)」填入。'], 422);
        }

        $kindLabel = ['news' => '公司最新消息', 'insight' => '技術洞察', 'work' => '精選實例', 'service' => '服務項目'][$data['kind']];
        $rules = self::qualityRules();

        $prompt = <<<PROMPT
你是宸揚資科的內容編輯，同時具備績效廣告文案測試思維。
請根據以下「{$kindLabel}」的主題，用繁體中文產出 **3 個切入角度完全不同** 的版本組合（標題 + 摘要 + SEO 描述）。
三個角度要分別觸發不同的讀者點擊動機：

1. **痛點切入（pain）**：點出讀者正在面對的具體問題、損失、挑戰，讓人「想點進來看怎麼解」
2. **成果切入（outcome）**：直接展示可達成的具體效益（含數字、百分比或時間），讓人「想點進來學方法」
3. **洞察切入（curiosity）**：分享反直覺的趨勢、研究發現或業界內幕，讓人「想點進來知道答案」

{$rules}

每個版本要求：
- **title**：30 字內、有點擊吸引力、優先用主動句與具體數字、不要超過原主題範圍。
- **excerpt**：60-100 字、跟 title 互補（不要重複 title 已說的話）、收尾要留鉤子或 takeaway。
- **meta_description**：80-120 字、像 Google 搜尋結果或社群分享卡片中的廣告文案；要讓人點得下去。

只輸出 JSON 物件（不要 markdown 圍欄）：
{"variations":[
  {"angle":"pain","angle_label":"痛點切入","title":"…","excerpt":"…","meta_description":"…"},
  {"angle":"outcome","angle_label":"成果切入","title":"…","excerpt":"…","meta_description":"…"},
  {"angle":"curiosity","angle_label":"洞察切入","title":"…","excerpt":"…","meta_description":"…"}
]}

主題：{$data['title']}
PROMPT;

        [$text, $status] = Gemini::generateText($prompt, [
            'temperature' => 0.9,
            'maxOutputTokens' => 2000,
            'responseMimeType' => 'application/json',
            'thinkingConfig' => ['thinkingBudget' => 0],
        ]);

        if ($status === 429) {
            return response()->json(['message' => 'Gemini 配額用完或被限流：所有金鑰都暫時不能用，請等約 30 分鐘讓 per-minute 限額重置，或到「整合設定（AI）」新增更多金鑰。'], 429);
        }
        if ($text === null || $text === '') {
            return response()->json(['message' => 'Gemini 沒有回傳內容，請稍等幾分鐘重試。'], 502);
        }

        $parsed = json_decode($text, true);
        $variations = is_array($parsed) ? (array) ($parsed['variations'] ?? []) : [];
        $clean = [];
        foreach ($variations as $v) {
            if (! is_array($v)) {
                continue;
            }
            $clean[] = [
                'angle' => (string) ($v['angle'] ?? ''),
                'angle_label' => (string) ($v['angle_label'] ?? ($v['angle'] ?? '')),
                'title' => trim((string) ($v['title'] ?? '')),
                'excerpt' => trim((string) ($v['excerpt'] ?? '')),
                'meta_description' => trim((string) ($v['meta_description'] ?? '')),
            ];
        }
        if (empty($clean)) {
            return response()->json(['message' => 'AI 沒有產出有效的版本，請重試。'], 502);
        }

        return response()->json(['variations' => $clean]);
    }
}

