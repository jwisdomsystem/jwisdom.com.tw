<?php

namespace App\Http\Controllers;

use App\Models\Page;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function show(string $key): Response
    {
        $page = Page::where('key', $key)->firstOrFail();

        return Inertia::render('page', ['page' => $page]);
    }
}
