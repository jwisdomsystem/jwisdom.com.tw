<?php

namespace App\Http\Controllers;

use App\Models\News;
use Inertia\Inertia;
use Inertia\Response;

class NewsController extends Controller
{
    public function index(): Response
    {
        return $this->list('news', [
            'eyebrow' => 'News',
            'title' => '最新消息',
            'desc' => '公司動態、技術分享與合作案例。',
            'path' => '/news',
        ]);
    }

    public function insights(): Response
    {
        return $this->list('insight', [
            'eyebrow' => 'Insights',
            'title' => '技術洞察',
            'desc' => '資安、系統架構、AI 等技術趨勢與實戰觀點。',
            'path' => '/insights',
        ]);
    }

    private function list(string $type, array $meta): Response
    {
        return Inertia::render('news/index', [
            'meta' => $meta,
            'news' => News::published()->type($type)->latest('published_at')
                ->paginate(9)
                ->through(fn ($n) => [
                    'title' => $n->title,
                    'slug' => $n->slug,
                    'category' => $n->category,
                    'type' => $n->type,
                    'excerpt' => $n->excerpt,
                    'cover' => $n->cover,
                    'cover_gradient' => $n->cover_gradient,
                    'published_at' => $n->published_at?->format('Y.m.d'),
                ]),
        ]);
    }

    public function show(News $news): Response
    {
        abort_unless($news->is_published, 404);

        return Inertia::render('news/show', [
            'item' => $news,
            'related' => News::published()->where('id', '!=', $news->id)
                ->latest('published_at')->take(3)
                ->get(['title', 'slug', 'category', 'cover', 'cover_gradient', 'published_at']),
        ]);
    }
}
