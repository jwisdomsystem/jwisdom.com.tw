<?php

namespace App\Http\Controllers;

use App\Models\Faq;
use Inertia\Inertia;
use Inertia\Response;

class FaqController extends Controller
{
    public function index(): Response
    {
        $groups = Faq::published()->orderBy('sort')->get()
            ->groupBy('group')
            ->map(fn ($items, $group) => [
                'group' => $group,
                'items' => $items->map(fn ($f) => ['question' => $f->question, 'answer' => $f->answer])->values(),
            ])->values();

        return Inertia::render('faq', ['groups' => $groups]);
    }
}
