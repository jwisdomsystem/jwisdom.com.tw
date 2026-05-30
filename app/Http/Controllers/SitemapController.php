<?php

namespace App\Http\Controllers;

use App\Models\News;
use App\Models\Service;
use App\Models\Work;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    private string $base = 'https://www.jwisdom.com.tw';

    public function index(): Response
    {
        $urls = [
            ['loc' => $this->base.'/', 'priority' => '1.0'],
            ['loc' => $this->base.'/news', 'priority' => '0.8'],
            ['loc' => $this->base.'/insights', 'priority' => '0.8'],
            ['loc' => $this->base.'/faq', 'priority' => '0.6'],
            ['loc' => $this->base.'/contact', 'priority' => '0.8'],
            ['loc' => $this->base.'/about', 'priority' => '0.7'],
            ['loc' => $this->base.'/terms', 'priority' => '0.3'],
            ['loc' => $this->base.'/privacy', 'priority' => '0.3'],
        ];

        foreach (Service::published()->get() as $s) {
            $urls[] = ['loc' => $this->base.'/services/'.$s->slug, 'lastmod' => optional($s->updated_at)->toAtomString(), 'priority' => '0.7'];
        }
        foreach (Work::published()->get() as $w) {
            $urls[] = ['loc' => $this->base.'/works/'.$w->slug, 'lastmod' => optional($w->updated_at)->toAtomString(), 'priority' => '0.6'];
        }
        foreach (News::published()->get() as $n) {
            $urls[] = [
                'loc' => $this->base.'/news/'.$n->slug,
                'lastmod' => optional($n->updated_at)->toAtomString(),
                'priority' => '0.6',
            ];
        }

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n"
            .'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n";
        foreach ($urls as $u) {
            $xml .= '  <url><loc>'.htmlspecialchars($u['loc']).'</loc>'
                .(! empty($u['lastmod']) ? '<lastmod>'.$u['lastmod'].'</lastmod>' : '')
                .'<priority>'.$u['priority'].'</priority></url>'."\n";
        }
        $xml .= '</urlset>';

        return response($xml, 200)->header('Content-Type', 'application/xml');
    }

    public function robots(): Response
    {
        $txt = "User-agent: *\n"
            ."Allow: /\n"
            ."Disallow: /admin\n"
            ."Disallow: /dashboard\n"
            ."Disallow: /settings\n"
            ."Disallow: /login\n"
            ."Disallow: /register\n\n"
            ."Sitemap: {$this->base}/sitemap.xml\n";

        return response($txt, 200)->header('Content-Type', 'text/plain');
    }
}
