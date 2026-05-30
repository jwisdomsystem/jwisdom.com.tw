<?php

namespace App\Console\Commands;

use App\Models\News;
use Illuminate\Console\Command;

class UnpublishOldInsights extends Command
{
    protected $signature = 'insights:unpublish-old {--months=2 : 超過幾個月自動下架}';

    protected $description = '將發佈超過指定月數的「技術洞察」自動下架（is_published=false），保持前台清單精簡';

    public function handle(): int
    {
        $months = max(1, (int) $this->option('months'));
        $cutoff = now()->subMonths($months);

        $count = News::where('type', 'insight')
            ->where('is_published', true)
            ->where('published_at', '<', $cutoff)
            ->update(['is_published' => false]);

        $this->info("已下架 {$count} 則發佈超過 {$months} 個月的技術洞察（界線：{$cutoff->toDateString()}）。");

        return self::SUCCESS;
    }
}
