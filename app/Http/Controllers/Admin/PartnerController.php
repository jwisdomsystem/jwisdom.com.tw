<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Partner;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PartnerController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/partners/index', [
            'items' => Partner::orderBy('sort')->orderBy('id')->get(['id', 'name', 'logo', 'url', 'sort', 'is_active']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/partners/form', ['item' => null]);
    }

    public function edit(Partner $partner): Response
    {
        return Inertia::render('admin/partners/form', ['item' => $partner]);
    }

    public function store(Request $request): RedirectResponse
    {
        Partner::create($this->validateData($request));

        return redirect()->route('admin.partners.index')->with('success', '已新增夥伴');
    }

    public function update(Request $request, Partner $partner): RedirectResponse
    {
        $partner->update($this->validateData($request));

        return redirect()->route('admin.partners.index')->with('success', '已更新夥伴');
    }

    public function toggle(Partner $partner): RedirectResponse
    {
        $partner->update(['is_active' => ! $partner->is_active]);

        return back()->with('success', $partner->is_active ? '已顯示於前台' : '已隱藏');
    }

    public function destroy(Partner $partner): RedirectResponse
    {
        $partner->delete();

        return back()->with('success', '已刪除夥伴');
    }

    private function validateData(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'logo' => ['nullable', 'string', 'max:500'],
            'url' => ['nullable', 'string', 'max:500'],
            'sort' => ['nullable', 'integer'],
            'is_active' => ['boolean'],
        ]);
    }
}
