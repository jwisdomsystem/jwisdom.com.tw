<?php

namespace App\Http\Controllers;

use App\Models\Work;
use Inertia\Inertia;
use Inertia\Response;

class WorkController extends Controller
{
    public function show(Work $work): Response
    {
        abort_unless($work->is_published, 404);

        return Inertia::render('works/show', [
            'work' => $work,
            'related' => Work::published()->where('id', '!=', $work->id)
                ->orderBy('sort')->take(3)->get(),
        ]);
    }
}
