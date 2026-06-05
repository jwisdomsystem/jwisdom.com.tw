<?php

namespace App\Http\Controllers;

use App\Models\News;
use App\Models\Service;
use App\Models\Work;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('home', [
            'services' => Service::published()->orderBy('sort')->get(),
            'works' => Work::published()->orderBy('sort')->get(),
            'insights' => News::published()->where('type', 'insight')->latest('published_at')->take(3)
                ->get(['translations', 'title', 'slug', 'category', 'excerpt', 'cover', 'published_at'])
                ->map(fn ($n) => [
                    'title' => $n->title, 'slug' => $n->slug, 'category' => $n->category,
                    'excerpt' => $n->excerpt, 'cover' => $n->cover,
                    'published_at' => $n->published_at?->format('Y.m.d'),
                ]),
        ]);
    }
}
