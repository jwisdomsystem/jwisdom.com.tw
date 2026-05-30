<!DOCTYPE html>
<html lang="zh-Hant-TW">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta property="og:locale" content="zh_TW">

        {{-- 效能：提前連線到第三方網域，加速 GA 與字體載入（改善 LCP） --}}
        <link rel="preconnect" href="https://www.googletagmanager.com">
        <link rel="dns-prefetch" href="https://www.googletagmanager.com">
        <link rel="preconnect" href="https://www.google-analytics.com">
        <link rel="preconnect" href="https://fonts.bunny.net" crossorigin>

        {{-- Google Analytics 4 --}}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-D43Z4Q46V7"></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-D43Z4Q46V7');
        </script>

        {{-- 標題改由各頁 Inertia <Head> 經 @inertiaHead 輸出，避免與此處重複（重複會讓 Google 取到錯誤標題）。 --}}
        <link rel="icon" href="/favicon.png" type="image/png">
        <link rel="apple-touch-icon" href="/favicon.png">

        <link href="https://fonts.bunny.net/css?family=noto-sans-tc:300,400,500,700,900&display=swap" rel="stylesheet" />

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
