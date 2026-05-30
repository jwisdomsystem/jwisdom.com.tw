<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Work;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class WorkController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/works/index', [
            'items' => Work::orderBy('sort')->paginate(20)->through(fn ($w) => [
                'id' => $w->id, 'name' => $w->name, 'slug' => $w->slug,
                'category' => $w->category, 'summary' => $w->summary, 'year' => $w->year,
                'cover' => $w->cover, 'cover_gradient' => $w->cover_gradient, 'url' => $w->url,
                'is_published' => $w->is_published,
            ]),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/works/form', ['item' => null]);
    }

    public function edit(Work $work): Response
    {
        return Inertia::render('admin/works/form', ['item' => $work]);
    }

    public function store(Request $request): RedirectResponse
    {
        Work::create($this->validateData($request));

        return redirect()->route('admin.works.index')->with('success', '已新增案例');
    }

    public function update(Request $request, Work $work): RedirectResponse
    {
        $work->update($this->validateData($request, $work->id));

        return redirect()->route('admin.works.index')->with('success', '已更新案例');
    }

    public function toggle(Work $work): RedirectResponse
    {
        $work->update(['is_published' => ! $work->is_published]);

        return back()->with('success', $work->is_published ? '已顯示於前台' : '已隱藏');
    }

    public function destroy(Work $work): RedirectResponse
    {
        $work->delete();

        return back()->with('success', '已刪除案例');
    }

    private function validateData(Request $request, ?int $id = null): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'slug' => ['nullable', 'string', 'max:150', 'unique:works,slug'.($id ? ",$id" : '')],
            'category' => ['nullable', 'string', 'max:100'],
            'summary' => ['nullable', 'string', 'max:500'],
            'body' => ['nullable', 'string'],
            'cover' => ['nullable', 'string', 'max:500'],
            'cover_gradient' => ['nullable', 'string', 'max:100'],
            'year' => ['nullable', 'string', 'max:20'],
            'url' => ['nullable', 'string', 'max:500'],
            'sort' => ['nullable', 'integer'],
            'is_published' => ['boolean'],
            'meta_title' => ['nullable', 'string', 'max:200'],
            'meta_description' => ['nullable', 'string', 'max:500'],
        ]);
        $data['slug'] = $data['slug'] ?: (Str::slug($data['name']) ?: 'work-'.now()->timestamp);

        return $data;
    }
}
