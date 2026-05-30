# 宸揚資科官網 jwisdom.com.tw — 專案交接文件

> 最後更新：2026-05-24　|　狀態：**已上線正式環境 www.jwisdom.com.tw**

---

## 0. 一句話摘要
舊 Vue SPA 官網（無原始碼）已**整站重建**為 Laravel 12 + React 19 + Inertia SSR 新站並上線，
全站內容可後台 CRUD、SEO 完整、含聯絡表單/地圖、技術洞察 Gemini 自動生成、網站分析。

---

## 1. 伺服器與登入

| 項目 | 內容 |
|------|------|
| EC2 IP | `3.86.172.115` |
| SSH | `ssh -i "D:\Claude\0_aws_key\JW_AI.pem" ubuntu@3.86.172.115`（帳號 ubuntu）|
| 環境 | Ubuntu，原生 nginx 1.24 + PHP-FPM（7.4/8.2/8.3）+ MySQL + Docker，前面有 Cloudflare（temp 子網域 DNS 直連無 Cloudflare）|
| 正式網域 | https://www.jwisdom.com.tw （新站）|
| temp | temp.jwisdom.com.tw → 已改成 301 轉向 www |

### ⚠️ PowerShell → ssh 引號雷（很重要）
- **外雙引號(PowerShell) + 內單引號(bash)** 才穩定
- `$(...)`、`head`、`grep` 等會被 PowerShell 誤判 → 複雜指令一律**寫成 .sh / .php 檔 scp 上去再執行**
- scp 多檔用 `-o` 陣列：`@("-i",$key,"-o","StrictHostKeyChecking=no","-o","UserKnownHostsFile=NUL")`

---

## 2. 專案位置與技術棧

| 項目 | 內容 |
|------|------|
| **正式專案路徑** | **`/var/www/jwisdom.com.tw`**（⚠️ 不是 /home/ubuntu/jwisdom-web，那個已搬走）|
| 技術棧 | Laravel 12 + React 19 + Inertia 2（**SSR**）+ TypeScript + Tailwind 4 + shadcn |
| Node / PHP / Composer | Node 20、PHP 8.3（`php8.3`）、composer /usr/local/bin |
| 資料庫 | Docker 容器 `jwisdom-mysql`，`127.0.0.1:3308`，db/user=`jwisdom`，密碼在專案 `.env` |
| SSR 常駐 | systemd 服務 `jwisdom-ssr`（`php8.3 artisan inertia:start-ssr`，node 跑 bootstrap/ssr/ssr.js，port 13714，WorkingDirectory 已指 /var/www/jwisdom.com.tw）|
| nginx | `jwisdom.com.tw` vhost root → `/var/www/jwisdom.com.tw/public`，php8.3-fpm；同目錄保留 balichurch/gascom/iatyu/payment/productmarket/shop/wra/laravel-core 等舊子站 |

### 🚀 改 code 部署流程（固定 SOP）
```bash
# 1. 本機寫好檔案 → scp 上傳到 /var/www/jwisdom.com.tw 對應路徑
# 2. 在伺服器：
cd /var/www/jwisdom.com.tw
npm run build:ssr                 # 前端有改才需要（建 client + ssr）
php8.3 artisan migrate --force    # 有新 migration 才需要
php8.3 artisan route:clear && php8.3 artisan config:cache && php8.3 artisan route:cache && php8.3 artisan view:cache
sudo systemctl restart jwisdom-ssr  # 前端/SSR 有改就要重啟
```
- 改 PHP 純後端：通常只需 `config:cache route:cache`（有改路由）
- 改前端 .tsx：一定要 `npm run build:ssr` + 重啟 jwisdom-ssr

---

## 3. 後台

| 項目 | 內容 |
|------|------|
| 登入 | https://www.jwisdom.com.tw/login |
| 帳號 | `admin@jwisdom.com.tw` / `password` |
| ⚠️ 待辦 | **盡快改密碼**（目前是預設）|
| 進入點 | /admin（middleware auth + admin；users.is_admin）|

### 後台功能（全部可 CRUD）
- **總覽** — 數量統計、未讀聯絡、最近聯絡
- **網站分析** /admin/analytics — 內建即時分析（今日/7日/30日/累計/不重複訪客 + 14日趨勢 + 熱門頁 + 最近訪問）；資料來自 page_views（middleware TrackPageView 自動記錄）
- **聯絡訊息** — /contact 表單來信收件匣（已讀/未讀/刪除/回信）
- **最新消息 / 技術洞察** — News CRUD，type 欄位分 news / insight
- **精選實例** Works CRUD
- **服務項目** Services CRUD
- **常見問題** FAQ CRUD
- **頁面內容** — 公司介紹/條款/隱私（edit）
- **廣告管理** — 4 版位 banner（announcement公告條 / carousel輪播 / promo推廣 / floating浮動）
- **網站設定** — 站名/Email/電話/地址/地圖定位
- **整合設定 (AI)** — Gemini 金鑰（明碼）、模型（下拉，動態抓清單）、每日則數、「立即抓取一則」按鈕

---

## 4. 資料表（migrations 已建）
- `settings`（key-value，App\Models\Setting::get/set 有快取）
- `banners`（zone/title/subtitle/body/url/cta_label/accent/sort/is_active/starts_at/ends_at）
- `news`（type=news|insight、slug、cover、cover_gradient、source_url、published_at、meta_*）
- `works`（slug、cover、cover_gradient、year、url、sort）
- `services`（slug、icon[code/app/gov/ai/mkt]、icon_bg、icon_text、sort）
- `faqs`（group、question、answer、sort）
- `pages`（key=about/terms/privacy）
- `contacts`（聯絡表單來信，is_read）
- `page_views`（網站分析）
- `users.is_admin`
- Seeder：`SiteContentSeeder`（初始內容 + admin 帳號）

---

## 5. 前台頁面與路由
| 路由 | 說明 |
|------|------|
| `/` | 首頁（Hero斜向架構圖 / 服務 / AI宣言 / 產品 / 推廣 / 精選實例 / 技術洞察 / 為什麼選我們 / 流程 / 聯絡 / 夥伴 / Footer）|
| `/services/{slug}` | 服務內頁 |
| `/works/{slug}` | 案例內頁 |
| `/news` | 最新消息（只列 type=news）|
| `/insights` | 技術洞察（只列 type=insight）|
| `/news/{slug}` | 消息/洞察 詳情（共用）|
| `/faq` `/about` `/terms` `/privacy` | FAQ / 公司介紹 / 條款 / 隱私 |
| `/contact` | 介紹與聯絡（公司介紹 + 聯絡資訊 + 表單存 DB + Google Map）|
| `/sitemap.xml` `/robots.txt` | SEO（動態產生）|

### 設計
- 視覺：slate-900 深色 + sky-400/cyan + 多彩點綴（服務/案例/洞察各色），Noto Sans TC，明亮為主
- 動態：Hero 流動連線/核心脈動/節點浮動/LIVE 閃爍、各區塊滾動進場（節奏放緩、有 prefers-reduced-motion 但用 !important 強制可動）
- ⚠️ 用戶設計敏感，不要憑空改風格；要嘛照現有、要嘛先給參考

---

## 6. SEO
- 每頁 Inertia `<Head>`：title/description/canonical/OG（SSR 輸出）
- JSON-LD：首頁 Organization、news/show Article
- 動態 sitemap.xml（含所有服務/案例/消息/洞察）+ robots.txt
- 真 404（bootstrap/app.php withExceptions → errors/error.tsx，正確狀態碼）
- 301：/index.php /about.php /news.php /zh_tw/* （⚠️ `.php` 舊網址會被 nginx php location 攔截，正式站要在 nginx 層另做）
- GA4：G-D43Z4Q46V7（app.blade.php）
- typography 套件（內頁 prose）

---

## 7. 技術洞察自動化（Gemini）
- 命令：`php8.3 artisan insights:fetch --count=N`（app/Console/Commands/FetchInsights.php）
- 流程：抓 Google News RSS（3 組查詢繁中）→ 去重 → Gemini 生成 120-180 字繁中摘要 → 存 News(type=insight)
- 金鑰/模型/則數：後台「整合設定」存 settings 表（gemini_api_key/gemini_model/insights_daily_count）
- **⚠️ 模型坑**：用戶金鑰對 `gemini-2.0-flash` 免費額度=0（429）、`gemini-1.5-flash` 回 404。**必須用 `gemini-2.5-flash`（可用✓）或 gemini-flash-latest**。預設已改 gemini-2.5-flash。
- 防呆：遇 429 立即停止（不再迴圈狂打）、限制嘗試次數、呼叫間延遲
- 排程：routes/console.php `Schedule::command('insights:fetch')->dailyAt('08:30')`；crontab 已有 `* * * * * cd /var/www/jwisdom.com.tw && php8.3 artisan schedule:run`

---

## 8. 待辦 / 已知事項
- [ ] **改 admin 密碼**（目前 password）
- [ ] 後台「整合設定」確認 Gemini 金鑰已填、模型選 gemini-2.5-flash（已設定，可再確認）
- [ ] RWD：公開頁 responsive-by-design、後台表格已可橫捲；**截圖工具在此環境逾時無法實機驗證手機**，建議實機測試回報
- [ ] 自動化測試：tests/Feature/SiteTest.php 已寫好，但需 `sudo apt install php8.3-sqlite3` 才能 `php artisan test`（之前 apt 被 auto-mode 擋；要跑需授權）
- [ ] `.php` 舊網址 301 需在 nginx 層處理
- [ ] 三個自有產品連結：IoT商城 shop.jwisdom.com.tw、ChatAI tw.chat-ai.app、AutoGrowth tw.auto-growth.app

---

## 9. 設計/溝通教訓（避免重蹈覆轍）
- 用戶對設計很敏感；連續多版被打槍（太偏離/AI感太重/太死/暗色太多）。**最後定調＝照現有官網風格 + 明亮多彩 + 適度動態**
- 抓真實資料：案例封面圖 public/images/works/*.jpg、夥伴 logo public/images/partners/*.png（AWS/IBM/MAERSK/PHPoC/Shopify/長榮海運）皆從舊站 /var/www/jwisdom.com.tw/assets 取得
- 改動偏好：前端改動集中批次做完再 build 一次（避免使用者開著的分頁載到舊 chunk）
