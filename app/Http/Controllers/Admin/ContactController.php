<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/contacts/index', [
            'contacts' => Contact::latest()->paginate(20)->through(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'email' => $c->email,
                'phone' => $c->phone,
                'company' => $c->company,
                'subject' => $c->subject,
                'message' => $c->message,
                'is_read' => $c->is_read,
                'created_at' => $c->created_at?->format('Y-m-d H:i'),
            ]),
            'unread' => Contact::where('is_read', false)->count(),
        ]);
    }

    public function markRead(Contact $contact): RedirectResponse
    {
        $contact->update(['is_read' => ! $contact->is_read]);

        return back();
    }

    public function destroy(Contact $contact): RedirectResponse
    {
        $contact->delete();

        return back()->with('success', '已刪除聯絡訊息');
    }
}
