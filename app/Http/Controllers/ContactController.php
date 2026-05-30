<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContactRequest;
use App\Models\Contact;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    public function show(): Response
    {
        return Inertia::render('contact');
    }

    public function store(StoreContactRequest $request): RedirectResponse
    {
        Contact::create($request->validated() + [
            'ip' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
        ]);

        return back()->with('success', '已收到您的訊息，我們會盡快與您聯繫！');
    }
}
