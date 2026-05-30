<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\News;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class NewsController extends Controller
{
    private const TYPE = 'news';

    public function index(Request $request): Response
    {
        return Inertia::render('admin/news/index', $this->listData($request));
    }

    /**
     * 共用列表資料：搜尋、狀態/分類篩選、排序、每篇瀏覽數（總數 + 近 7 日）。
     */
    private function listData(Request $request): array
    {
        $q = trim((string) $request->query('q', ''));
        $status = (string) $request->query('status', '');
        $cat = (string) $request->query('category', '');
        $sort = (string) $request->query('sort', 'date');

        $sevenDays = now()->subDays(7)->toDateTimeString();

        $items = News::query()
            ->where('type', self::TYPE)
            ->select('id', 'title', 'slug', 'category', 'excerpt', 'cover', 'cover_gradient', 'is_published', 'published_at')
            ->selectRaw("(select count(*) from page_views where page_views.path = concat('/news/', news.slug)) as views_total")
            ->selectRaw("(select count(*) from page_views where page_views.path = concat('/news/', news.slug) and page_views.created_at >= ?) as views_7d", [$sevenDays])
            ->when($q !== '', fn ($query) => $query->where('title', 'like', "%{$q}%"))
            ->when($status === 'published', fn ($query) => $query->where('is_published', true))
            ->when($status === 'draft', fn ($query) => $query->where('is_published', false))
            ->when($cat !== '', fn ($query) => $query->where('category', $cat))
            ->when($sort === 'views', fn ($query) => $query->orderByDesc('views_total'), fn ($query) => $query->orderByDesc('published_at'))
            ->paginate(15)
            ->withQueryString()
            ->through(fn ($n) => [
                'id' => $n->id, 'title' => $n->title, 'slug' => $n->slug,
                'category' => $n->category, 'excerpt' => $n->excerpt,
                'cover' => $n->cover, 'cover_gradient' => $n->cover_gradient,
                'is_published' => $n->is_published,
                'published_at' => $n->published_at?->format('Y-m-d'),
                'views_total' => (int) $n->views_total, 'views_7d' => (int) $n->views_7d,
            ]);

        return [
            'items' => $items,
            'categories' => $this->categories(),
            'filters' => ['q' => $q, 'status' => $status, 'category' => $cat, 'sort' => $sort],
        ];
    }

    public function create(): Response
    {
        return Inertia::render('admin/news/form', ['item' => null, 'categories' => $this->categories()]);
    }

    public function edit(News $news): Response
    {
        return Inertia::render('admin/news/form', ['item' => $news, 'categories' => $this->categories()]);
    }

    private function categories(): array
    {
        return News::where('type', self::TYPE)->whereNotNull('category')
            ->distinct()->orderBy('category')->pluck('category')->all();
    }

    public function store(Request $request): RedirectResponse
    {
        News::create($this->validateData($request));

        return redirect()->route('admin.news.index')->with('success', '已新增消息');
    }

    public function update(Request $request, News $news): RedirectResponse
    {
        $news->update($this->validateData($request, $news->id));

        return redirect()->route('admin.news.index')->with('success', '已更新消息');
    }

    public function toggle(News $news): RedirectResponse
    {
        $news->update(['is_published' => ! $news->is_published]);

        return back()->with('success', $news->is_published ? '已發佈' : '已轉為草稿');
    }

    public function duplicate(News $news): RedirectResponse
    {
        $copy = $news->replicate();
        $copy->title = $news->title.'（副本）';
        $copy->slug = $news->slug.'-copy-'.Str::lower(Str::random(4));
        $copy->is_published = false;
        $copy->published_at = now();
        $copy->save();

        return redirect()->route('admin.news.edit', $copy->id)->with('success', '已複製為草稿，請編輯後再發佈');
    }

    public function destroy(News $news): RedirectResponse
    {
        $news->delete();

        return back()->with('success', '已刪除消息');
    }

    private function validateData(Request $request, ?int $id = null): array
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'slug' => ['nullable', 'string', 'max:200', 'unique:news,slug'.($id ? ",$id" : '')],
            'category' => ['nullable', 'string', 'max:50'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'body' => ['nullable', 'string'],
            'cover' => ['nullable', 'string', 'max:500'],
            'cover_gradient' => ['nullable', 'string', 'max:100'],
            'meta_title' => ['nullable', 'string', 'max:200'],
            'meta_description' => ['nullable', 'string', 'max:300'],
            'is_published' => ['boolean'],
            'published_at' => ['nullable', 'date'],
        ]);

        $data['type'] = self::TYPE;
        $data['slug'] = $data['slug'] ?: (Str::slug($data['title']) ?: 'post-'.now()->timestamp);
        $data['published_at'] = $data['published_at'] ?: now();

        return $data;
    }
}
