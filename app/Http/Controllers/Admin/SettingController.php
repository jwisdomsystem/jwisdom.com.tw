<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    private array $keys = [
        'site_name', 'footer_tagline', 'footer_copyright', 'contact_email', 'contact_phone', 'contact_fax', 'contact_address',
        'contact_hours', 'contact_map_query',
        'home_meta_description', 'og_image',
        'stat_1_value', 'stat_1_label', 'stat_2_value', 'stat_2_label',
        'stat_3_value', 'stat_3_label', 'stat_4_value', 'stat_4_label',
        'social_facebook', 'social_instagram', 'social_threads', 'social_youtube', 'social_tiktok',
        'line_qr_image', 'line_qr_label',
    ];

    public function edit(): Response
    {
        return Inertia::render('admin/settings', [
            'settings' => Setting::pluck('value', 'key'),
            'keys' => $this->keys,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'settings' => ['required', 'array'],
            'settings.*' => ['nullable', 'string', 'max:500'],
        ]);

        foreach ($data['settings'] as $key => $value) {
            Setting::set($key, $value);
        }

        return back()->with('success', '已儲存設定');
    }
}
