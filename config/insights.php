<?php

return [
    // 從 .env 讀取 GEMINI_API_KEY
    'gemini_key' => env('GEMINI_API_KEY'),
    'gemini_model' => env('GEMINI_MODEL', 'gemini-2.5-flash'),

    // 每日自動產生幾則
    'daily_count' => (int) env('INSIGHTS_DAILY_COUNT', 2),

    // 產業相關新聞來源（Google News RSS，繁中）
    'feeds' => [
        'https://news.google.com/rss/search?q=AI%20%E4%BC%81%E6%A5%AD%20%E6%95%B8%E4%BD%8D%E8%BD%89%E5%9E%8B&hl=zh-TW&gl=TW&ceid=TW:zh-Hant',
        'https://news.google.com/rss/search?q=%E8%B3%87%E5%AE%89%20%E8%BB%9F%E9%AB%94%E9%96%8B%E7%99%BC%20%E7%B3%BB%E7%B5%B1%E6%95%B4%E5%90%88&hl=zh-TW&gl=TW&ceid=TW:zh-Hant',
        'https://news.google.com/rss/search?q=%E7%89%A9%E8%81%AF%E7%B6%B2%20IoT%20%E6%99%BA%E6%85%A7%E5%88%B6%E9%80%A0&hl=zh-TW&gl=TW&ceid=TW:zh-Hant',
    ],

    // 洞察卡封面漸層（隨機挑一個）
    'gradients' => [
        'from-slate-700 to-slate-900',
        'from-sky-600 to-cyan-500',
        'from-indigo-600 to-sky-500',
        'from-emerald-600 to-teal-500',
    ],
];
