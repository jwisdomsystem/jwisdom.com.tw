<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// 每日自動產生技術洞察（Gemini 生成摘要）
Schedule::command('insights:fetch')->dailyAt('08:30');

// 每日自動下架發佈超過 2 個月的技術洞察
Schedule::command('insights:unpublish-old')->dailyAt('03:00');
