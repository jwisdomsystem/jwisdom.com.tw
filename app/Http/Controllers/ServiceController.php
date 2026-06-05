<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    public function show(Service $service): Response
    {
        abort_unless($service->is_published, 404);

        return Inertia::render('services/show', [
            'service' => $service,
            'others' => Service::published()->where('id', '!=', $service->id)
                ->orderBy('sort')->get(['translations', 'title', 'slug', 'icon_bg', 'icon_text']),
        ]);
    }
}
