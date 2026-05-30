<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/products/index', [
            'items' => Product::orderBy('sort')->get(['id', 'name', 'en', 'tag', 'url', 'accent', 'sort', 'is_active']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/products/form', ['item' => null]);
    }

    public function edit(Product $product): Response
    {
        return Inertia::render('admin/products/form', ['item' => $product]);
    }

    public function store(Request $request): RedirectResponse
    {
        Product::create($this->validateData($request));

        return redirect()->route('admin.products.index')->with('success', '已新增產品');
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $product->update($this->validateData($request));

        return redirect()->route('admin.products.index')->with('success', '已更新產品');
    }

    public function toggle(Product $product): RedirectResponse
    {
        $product->update(['is_active' => ! $product->is_active]);

        return back()->with('success', $product->is_active ? '已顯示於前台' : '已隱藏');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $product->delete();

        return back()->with('success', '已刪除產品');
    }

    private function validateData(Request $request): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'en' => ['nullable', 'string', 'max:150'],
            'tag' => ['nullable', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:1000'],
            'url' => ['nullable', 'string', 'max:500'],
            'features' => ['nullable', 'array'],
            'features.*' => ['nullable', 'string', 'max:200'],
            'accent' => ['nullable', 'string', 'max:100'],
            'sort' => ['nullable', 'integer'],
            'is_active' => ['boolean'],
        ]);
        $data['features'] = array_values(array_filter($data['features'] ?? [], fn ($f) => trim((string) $f) !== ''));

        return $data;
    }
}
