<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BannerController extends Controller
{
    private array $zones = ['announcement', 'carousel', 'promo', 'floating'];

    public function index(): Response
    {
        return Inertia::render('admin/banners/index', [
            'items' => Banner::orderBy('zone')->orderBy('sort')->get(),
            'zones' => $this->zones,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/banners/form', ['item' => null, 'zones' => $this->zones]);
    }

    public function edit(Banner $banner): Response
    {
        return Inertia::render('admin/banners/form', ['item' => $banner, 'zones' => $this->zones]);
    }

    public function store(Request $request): RedirectResponse
    {
        Banner::create($this->validateData($request));

        return redirect()->route('admin.banners.index')->with('success', '已新增廣告');
    }

    public function update(Request $request, Banner $banner): RedirectResponse
    {
        $banner->update($this->validateData($request));

        return redirect()->route('admin.banners.index')->with('success', '已更新廣告');
    }

    public function toggle(Banner $banner): RedirectResponse
    {
        $banner->update(['is_active' => ! $banner->is_active]);

        return back()->with('success', $banner->is_active ? '已啟用' : '已停用');
    }

    public function destroy(Banner $banner): RedirectResponse
    {
        $banner->delete();

        return back()->with('success', '已刪除廣告');
    }

    private function validateData(Request $request): array
    {
        return $request->validate([
            'zone' => ['required', 'in:announcement,carousel,promo,floating'],
            'title' => ['nullable', 'string', 'max:200'],
            'subtitle' => ['nullable', 'string', 'max:200'],
            'body' => ['nullable', 'string', 'max:500'],
            'image' => ['nullable', 'string', 'max:500'],
            'url' => ['nullable', 'string', 'max:500'],
            'cta_label' => ['nullable', 'string', 'max:50'],
            'accent' => ['nullable', 'string', 'max:100'],
            'sort' => ['nullable', 'integer'],
            'is_active' => ['boolean'],
        ]);
    }
}
