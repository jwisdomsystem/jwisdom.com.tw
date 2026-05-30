<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/pages/index', [
            'items' => Page::orderBy('id')->get(['id', 'key', 'title']),
        ]);
    }

    public function edit(Page $page): Response
    {
        return Inertia::render('admin/pages/form', ['item' => $page]);
    }

    public function update(Request $request, Page $page): RedirectResponse
    {
        $page->update($request->validate([
            'title' => ['required', 'string', 'max:150'],
            'body' => ['nullable', 'string'],
            'meta_title' => ['nullable', 'string', 'max:200'],
            'meta_description' => ['nullable', 'string', 'max:300'],
        ]));

        return redirect()->route('admin.pages.index')->with('success', '已更新頁面');
    }
}
