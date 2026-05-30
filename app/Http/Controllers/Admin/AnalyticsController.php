<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PageView;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    public function index(): Response
    {
        $trend = collect(range(13, 0))->map(function ($d) {
            $day = Carbon::today()->subDays($d);

            return [
                'date' => $day->format('m/d'),
                'count' => PageView::whereDate('created_at', $day)->count(),
            ];
        })->values();

        return Inertia::render('admin/analytics', [
            'stats' => [
                'today' => PageView::whereDate('created_at', Carbon::today())->count(),
                'week' => PageView::where('created_at', '>=', now()->subDays(7))->count(),
                'month' => PageView::where('created_at', '>=', now()->subDays(30))->count(),
                'total' => PageView::count(),
                'uniqueWeek' => PageView::where('created_at', '>=', now()->subDays(7))->distinct('ip')->count('ip'),
            ],
            'trend' => $trend,
            'topPages' => PageView::where('created_at', '>=', now()->subDays(30))
                ->selectRaw('path, COUNT(*) as c')->groupBy('path')->orderByDesc('c')->take(10)->get(),
            'recent' => PageView::latest('created_at')->take(15)->get(['path', 'referrer', 'ip', 'created_at'])
                ->map(fn ($v) => [
                    'path' => $v->path,
                    'referrer' => $v->referrer,
                    'created_at' => $v->created_at?->format('m-d H:i'),
                ]),
        ]);
    }
}
