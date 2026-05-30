<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FaqController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/faqs/index', [
            'items' => Faq::orderBy('group')->orderBy('sort')->get(['id', 'group', 'question', 'sort', 'is_published']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/faqs/form', ['item' => null]);
    }

    public function edit(Faq $faq): Response
    {
        return Inertia::render('admin/faqs/form', ['item' => $faq]);
    }

    public function store(Request $request): RedirectResponse
    {
        Faq::create($this->validateData($request));

        return redirect()->route('admin.faqs.index')->with('success', '已新增問答');
    }

    public function update(Request $request, Faq $faq): RedirectResponse
    {
        $faq->update($this->validateData($request));

        return redirect()->route('admin.faqs.index')->with('success', '已更新問答');
    }

    public function toggle(Faq $faq): RedirectResponse
    {
        $faq->update(['is_published' => ! $faq->is_published]);

        return back()->with('success', $faq->is_published ? '已顯示於前台' : '已隱藏');
    }

    public function destroy(Faq $faq): RedirectResponse
    {
        $faq->delete();

        return back()->with('success', '已刪除問答');
    }

    private function validateData(Request $request): array
    {
        return $request->validate([
            'group' => ['required', 'string', 'max:50'],
            'question' => ['required', 'string', 'max:300'],
            'answer' => ['required', 'string'],
            'sort' => ['nullable', 'integer'],
            'is_published' => ['boolean'],
        ]);
    }
}
