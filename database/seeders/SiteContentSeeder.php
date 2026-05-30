<?php

namespace Database\Seeders;

use App\Models\Banner;
use App\Models\Faq;
use App\Models\News;
use App\Models\Page;
use App\Models\Service;
use App\Models\Setting;
use App\Models\User;
use App\Models\Work;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SiteContentSeeder extends Seeder
{
    public function run(): void
    {
        // ===== Admin =====
        User::updateOrCreate(
            ['email' => 'admin@jwisdom.com.tw'],
            ['name' => '管理員', 'password' => Hash::make('password'), 'is_admin' => true]
        );

        // ===== Settings =====
        $settings = [
            'site_name' => '宸揚資科 JWisdom',
            'contact_email' => 'service@jwisdom.com.tw',
            'contact_phone' => '+886-2-xxxx-xxxx',
            'contact_address' => '台北市',
            'hero_eyebrow' => '商業落地的技術夥伴',
            'stat_years' => '15', 'stat_projects' => '200', 'stat_clients' => '50', 'stat_ontime' => '98',
        ];
        foreach ($settings as $k => $v) {
            Setting::updateOrCreate(['key' => $k], ['value' => $v, 'group' => 'general']);
        }

        // ===== Services =====
        $services = [
            ['軟體開發', 'software-development', '企業系統、SaaS 平台、後台管理與自動化流程，依需求量身打造、長期維運。', 'code', 'bg-sky-100', 'text-sky-600'],
            ['網頁及 App 設計', 'web-app-design', 'RWD 官網、品牌形象站、iOS / Android App，兼顧視覺體驗與效能。', 'app', 'bg-indigo-100', 'text-indigo-600'],
            ['政府 / 教育系統', 'gov-edu-systems', '熟悉公部門與教育場域需求，符合規範、穩定可靠的標案級系統開發。', 'gov', 'bg-emerald-100', 'text-emerald-600'],
            ['AI 智慧整合', 'ai-integration', '導入生成式 AI、智慧客服與自動化應用，讓既有系統更聰明、更省力。', 'ai', 'bg-violet-100', 'text-violet-600'],
            ['數位行銷設計', 'digital-marketing', '品牌視覺、社群素材與行銷活動頁，從策略到執行協助提升曝光與轉換。', 'mkt', 'bg-amber-100', 'text-amber-600'],
        ];
        foreach ($services as $i => [$title, $slug, $summary, $icon, $bg, $text]) {
            Service::updateOrCreate(['slug' => $slug], [
                'title' => $title, 'summary' => $summary, 'icon' => $icon,
                'icon_bg' => $bg, 'icon_text' => $text, 'sort' => $i, 'is_published' => true,
            ]);
        }

        // ===== Works =====
        $works = [
            ['Learn Fit 亞太健身', 'learnfit', 'APP / WEB', '為亞太健康醫學教育平台打造專屬 App 與網站，整合教育與數位體驗。', '2025', 'from-sky-500 to-cyan-400', '/images/works/learnfit.jpg'],
            ['麗園牧場', 'liyuan-farm', 'ERP · 品牌官網', '為麗園牧場打造優秀的 ERP 與品牌數位門面。', '2024', 'from-emerald-500 to-teal-400', '/images/works/liyuan.jpg'],
            ['台北市公車預約', 'taipei-bus', '政府專案 · 系統整合', '公部門場域的預約與調度整合，穩定承載大量使用。', '2023', 'from-indigo-500 to-sky-400', '/images/works/taipei-bus.jpg'],
            ['祥亮行銷', 'xiangliang', 'WEB DESIGN · 數位行銷', '打造專屬網頁設計，呈現獨特定位與美學。', '2023', 'from-amber-500 to-orange-400', '/images/works/xiangliang.jpg'],
            ['嘉邑行善團 官網', 'jiayi-charity', 'WEB · Odoo', '協助嘉義嘉邑行善團展現其獨特精神與美學品味。', '2022', 'from-rose-500 to-pink-400', '/images/works/jiayi.jpg'],
        ];
        foreach ($works as $i => [$name, $slug, $cat, $summary, $year, $grad, $cover]) {
            Work::updateOrCreate(['slug' => $slug], [
                'name' => $name, 'category' => $cat, 'summary' => $summary,
                'year' => $year, 'cover_gradient' => $grad, 'cover' => $cover, 'sort' => $i, 'is_published' => true,
            ]);
        }

        // ===== Banners (廣告曝光位) =====
        $banners = [
            ['announcement', 'NEW', null, 'ChatAI 擬真客服全新上線——7×24 不打烊的 AI 客服', 'https://tw.chat-ai.app', '免費體驗', null, 0],
            ['carousel', null, '政府 · 企業數位轉型', '把複雜的需求，交給懂落地的團隊。15 年、200+ 專案經驗，從規劃到維運一條龍。', '/#contact', '免費評估專案', 'from-slate-800 to-slate-900', 0],
            ['carousel', null, 'ChatAI 擬真客服', '7×24 不打烊的 AI 客服，多渠道整合、自動應答與預約，服務不中斷。', 'https://tw.chat-ai.app', '免費體驗 ChatAI', 'from-indigo-600 to-sky-600', 1],
            ['carousel', null, 'AutoGrowth 智慧攬客', '讓 AI 自動帶來客戶，AI 短影音生成 + 自動跟進，讓成長自動發生。', 'https://tw.auto-growth.app', '了解 AutoGrowth', 'from-cyan-600 to-emerald-600', 2],
            ['promo', '想讓 AI 自動帶來客戶？', '限時推廣 · Featured', 'AutoGrowth 智慧攬客：AI 短影音生成 + 自動跟進序列，讓成長自動發生。', 'https://tw.auto-growth.app', '立即了解', 'from-sky-500 to-cyan-400', 0],
            ['floating', '有專案想法？', '免費諮詢', '留下需求，由顧問免費為你評估可行性。', '/#contact', '立即諮詢', null, 0],
        ];
        Banner::truncate();
        foreach ($banners as [$zone, $title, $subtitle, $body, $url, $cta, $accent, $sort]) {
            Banner::create([
                'zone' => $zone, 'title' => $title, 'subtitle' => $subtitle, 'body' => $body,
                'url' => $url, 'cta_label' => $cta, 'accent' => $accent, 'sort' => $sort, 'is_active' => true,
            ]);
        }

        // ===== News =====
        $news = [
            ['宸揚資科完成新版企業官網改版', 'jwisdom-new-website', '公司動態', 'news', '採用全新技術架構，提升載入速度與 SEO 表現。', 'from-sky-500 to-cyan-400'],
            ['將生成式 AI 導入既有企業系統的實務心得', 'genai-into-enterprise', '技術分享', 'news', '從需求評估到上線維運，分享落地心法。', 'from-indigo-500 to-sky-400'],
            ['攜手公部門完成場域線上線下整合專案', 'gov-omo-project', '合作案例', 'news', '線上線下整合，現場運作效率顯著提升。', 'from-emerald-500 to-teal-400'],
        ];
        foreach ($news as $i => [$title, $slug, $cat, $type, $excerpt, $grad]) {
            News::updateOrCreate(['slug' => $slug], [
                'title' => $title, 'category' => $cat, 'type' => $type, 'excerpt' => $excerpt,
                'body' => '<p>'.$excerpt.'</p>', 'cover_gradient' => $grad,
                'is_published' => true, 'published_at' => now()->subDays(($i + 1) * 12),
            ]);
        }

        // ===== 技術洞察（Insights）=====
        $insights = [
            ['零信任架構：企業資安的最後一道防線', 'zero-trust-architecture', '資訊安全', '在邊界日益模糊的雲端時代，零信任（Zero Trust）以「永不信任、持續驗證」重新定義企業資安防護。', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800'],
            ['從單體到微服務：大型系統重構實戰', 'monolith-to-microservices', '系統架構', '當單體應用成長到難以維護，微服務拆分能帶來彈性與可擴充性——但也伴隨複雜度，本文分享實戰取捨。', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800'],
            ['RAG 技術在企業知識庫的應用場景', 'rag-enterprise-knowledge-base', 'AI 應用', '檢索增強生成（RAG）讓大型語言模型能引用企業內部知識，打造準確、可溯源的智慧問答與客服。', 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800'],
        ];
        foreach ($insights as $i => [$title, $slug, $cat, $excerpt, $cover]) {
            News::updateOrCreate(['slug' => $slug], [
                'title' => $title, 'category' => $cat, 'type' => 'insight', 'excerpt' => $excerpt,
                'body' => '<p>'.$excerpt.'</p><p>（本文為技術洞察摘要，完整內容由編輯或每日自動產生。）</p>',
                'cover' => $cover, 'cover_gradient' => 'from-slate-700 to-slate-900',
                'is_published' => true, 'published_at' => now()->subDays($i + 1),
            ]);
        }

        // ===== FAQ =====
        $faqs = [
            ['服務流程', '一個專案大概需要多久？', '視專案規模而定，一般中小型系統約 1–3 個月，大型專案會在需求確認後提供明確時程。'],
            ['服務流程', '可以只做部分功能或維護既有系統嗎？', '可以。我們提供新建、改版、功能擴充與長期維運等彈性合作方式。'],
            ['報價合作', '如何取得報價？', '透過官網「聯絡我們」留下需求，顧問會免費為您評估並提供初步建議與報價。'],
            ['技術', '系統上線後有提供維運嗎？', '有。我們提供上線後的監控、維護與優化服務，是長期合作的技術夥伴。'],
        ];
        foreach ($faqs as $i => [$group, $q, $a]) {
            Faq::updateOrCreate(['question' => $q], [
                'group' => $group, 'answer' => '<p>'.$a.'</p>', 'sort' => $i, 'is_published' => true,
            ]);
        }

        // ===== Pages =====
        $pages = [
            ['about', '公司介紹', '<p>宸揚資科 JWisdom 是商業落地的技術夥伴，深耕系統開發、網頁與 App、政府教育系統、AI 智慧整合與數位行銷，協助企業把想法做成穩定運作的系統。</p>'],
            ['terms', '使用者條款', '<p>歡迎使用宸揚資科 JWisdom 網站。使用本網站即表示您同意遵守以下條款⋯（請補充正式條款內容）。</p>'],
            ['privacy', '隱私權保護', '<p>宸揚資科 JWisdom 重視您的隱私權。本政策說明我們如何蒐集、使用與保護您的個人資料⋯（請補充正式隱私權政策）。</p>'],
        ];
        foreach ($pages as [$key, $title, $body]) {
            Page::updateOrCreate(['key' => $key], ['title' => $title, 'body' => $body]);
        }
    }
}
