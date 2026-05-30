<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\Contact;
use App\Models\Faq;
use App\Models\News;
use App\Models\Service;
use App\Models\Work;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/dashboard', [
            'stats' => [
                'contacts' => Contact::count(),
                'unread' => Contact::where('is_read', false)->count(),
                'news' => News::count(),
                'works' => Work::count(),
                'services' => Service::count(),
                'banners' => Banner::count(),
                'faqs' => Faq::count(),
            ],
            'recentContacts' => Contact::latest()->take(5)->get(['id', 'name', 'email', 'subject', 'is_read', 'created_at']),
        ]);
    }
}
