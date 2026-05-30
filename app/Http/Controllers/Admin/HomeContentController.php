<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeContentController extends Controller
{
    private const DEFAULT_WHY = [
        ['title' => '策略先行', 'desc' => '先釐清商業目標與使用場景，再決定技術，避免做出沒人用的系統。'],
        ['title' => '技術紮實', 'desc' => '前後端、雲端、AI 全棧自有團隊，不外包、不卡關。'],
        ['title' => '落地導向', 'desc' => '懂真實場域的眉角，讓系統在現場穩定、好用、可維運。'],
        ['title' => '長期夥伴', 'desc' => '交付之後，從維運到優化持續陪伴，一起把系統養好。'],
    ];

    private const DEFAULT_PROCESS = [
        ['title' => '需求諮詢', 'desc' => '深入了解你的商業目標、使用場景與痛點，免費評估可行性。'],
        ['title' => '規劃設計', 'desc' => '提出系統架構、流程與介面設計，確認方向與時程後動工。'],
        ['title' => '開發實作', 'desc' => '敏捷迭代開發，過程透明、隨時可看進度，確保如期交付。'],
        ['title' => '維運優化', 'desc' => '上線不是結束，持續監控、維護與優化，陪你把系統養好。'],
    ];

    public function edit(): Response
    {
        return Inertia::render('admin/home-content', [
            'why' => $this->read('home_why', self::DEFAULT_WHY),
            'process' => $this->read('home_process', self::DEFAULT_PROCESS),
        ]);
    }

    private function read(string $key, array $default): array
    {
        $val = Setting::get($key);
        if (! $val) {
            return $default;
        }
        $arr = json_decode($val, true);

        return is_array($arr) && ! empty($arr) ? $arr : $default;
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'why' => ['array'],
            'why.*.title' => ['nullable', 'string', 'max:50'],
            'why.*.desc' => ['nullable', 'string', 'max:300'],
            'process' => ['array'],
            'process.*.title' => ['nullable', 'string', 'max:50'],
            'process.*.desc' => ['nullable', 'string', 'max:300'],
        ]);

        $clean = fn (array $rows, array $keys) => array_values(array_filter(array_map(
            fn ($r) => array_map(fn ($k) => trim((string) ($r[$k] ?? '')), array_combine($keys, $keys)),
            $rows,
        ), fn ($r) => implode('', $r) !== ''));

        Setting::set('home_why', json_encode($clean($data['why'] ?? [], ['title', 'desc']), JSON_UNESCAPED_UNICODE));
        Setting::set('home_process', json_encode($clean($data['process'] ?? [], ['title', 'desc']), JSON_UNESCAPED_UNICODE));

        return back()->with('success', '已更新首頁區塊');
    }
}
