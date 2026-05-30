<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/services/index', [
            'items' => Service::orderBy('sort')->get(['id', 'title', 'slug', 'summary', 'icon', 'icon_bg', 'icon_text', 'sort', 'is_published']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/services/form', ['item' => null]);
    }

    public function edit(Service $service): Response
    {
        return Inertia::render('admin/services/form', ['item' => $service]);
    }

    public function store(Request $request): RedirectResponse
    {
        Service::create($this->validateData($request));

        return redirect()->route('admin.services.index')->with('success', '已新增服務');
    }

    public function update(Request $request, Service $service): RedirectResponse
    {
        $service->update($this->validateData($request, $service->id));

        return redirect()->route('admin.services.index')->with('success', '已更新服務');
    }

    public function toggle(Service $service): RedirectResponse
    {
        $service->update(['is_published' => ! $service->is_published]);

        return back()->with('success', $service->is_published ? '已顯示於前台' : '已隱藏');
    }

    public function destroy(Service $service): RedirectResponse
    {
        $service->delete();

        return back()->with('success', '已刪除服務');
    }

    private function validateData(Request $request, ?int $id = null): array
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:150'],
            'slug' => ['nullable', 'string', 'max:150', 'unique:services,slug'.($id ? ",$id" : '')],
            'summary' => ['nullable', 'string', 'max:500'],
            'body' => ['nullable', 'string'],
            'icon' => ['nullable', 'string', 'max:30'],
            'icon_bg' => ['nullable', 'string', 'max:50'],
            'icon_text' => ['nullable', 'string', 'max:50'],
            'sort' => ['nullable', 'integer'],
            'is_published' => ['boolean'],
            'meta_title' => ['nullable', 'string', 'max:200'],
            'meta_description' => ['nullable', 'string', 'max:500'],
        ]);
        $data['slug'] = $data['slug'] ?: (Str::slug($data['title']) ?: 'service-'.now()->timestamp);

        return $data;
    }
}
