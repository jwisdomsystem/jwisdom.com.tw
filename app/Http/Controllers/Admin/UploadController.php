<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\Img;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    public function image(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:5120'],
        ]);

        // gif 保留原樣（避免動圖變靜態）；其餘轉 WebP 縮小體積
        $binary = (string) file_get_contents($request->file('file')->getRealPath());
        if ($request->file('file')->getClientOriginalExtension() === 'gif') {
            [$out, $ext] = [$binary, 'gif'];
        } else {
            [$out, $ext] = Img::webp($binary);
        }

        $path = 'covers/up-'.now()->format('YmdHis').'-'.Str::lower(Str::random(5)).'.'.$ext;
        if (! Storage::disk('public')->put($path, $out)) {
            return response()->json(['message' => '圖片儲存失敗，請確認 storage/app/public/covers 目錄權限。'], 500);
        }

        return response()->json(['url' => Storage::disk('public')->url($path)]);
    }
}
