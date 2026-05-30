import { useForm } from '@inertiajs/react';
import { type FormEvent } from 'react';
import { Save, Building2, Mail, Phone, Printer, MapPin, Globe, BarChart3, Clock, Search, Share2, QrCode } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { inputCls, labelCls, helpCls, Card, ImageUploadButton } from '@/components/admin/ui';

type Settings = Record<string, string>;

const meta: Record<string, { label: string; icon: typeof Mail; placeholder?: string }> = {
    contact_email: { label: '聯絡 Email', icon: Mail, placeholder: 'service@jwisdom.com.tw' },
    contact_phone: { label: '聯絡電話', icon: Phone },
    contact_fax: { label: '傳真號碼', icon: Printer },
    contact_address: { label: '公司地址', icon: MapPin },
    contact_hours: { label: '服務時間', icon: Clock, placeholder: '週一至週五 09:00–18:00' },
    contact_map_query: { label: '地圖定位地址（Google Map 用）', icon: Globe },
};

const statRows = [1, 2, 3, 4].map((i) => ({ i, valueKey: `stat_${i}_value`, labelKey: `stat_${i}_label` }));
const statPlaceholders: Record<number, [string, string]> = {
    1: ['15+', '年開發經驗'], 2: ['200+', '完成專案'], 3: ['50+', '政府/企業客戶'], 4: ['98%', '專案如期交付'],
};

export default function AdminSettings({ settings, keys }: { settings: Settings; keys: string[] }) {
    const initial: Settings = {};
    keys.forEach((k) => (initial[k] = settings[k] ?? ''));
    const { data, setData, put, processing } = useForm<{ settings: Settings }>({ settings: initial });
    const submit = (e: FormEvent) => { e.preventDefault(); put('/admin/settings', { preserveScroll: true }); };
    const set = (k: string, v: string) => setData('settings', { ...data.settings, [k]: v });
    const contactKeys = keys.filter((k) => k.startsWith('contact_'));

    const actions = (
        <button type="submit" form="settings-form" disabled={processing} className="inline-flex items-center gap-1.5 rounded-full bg-sky-500 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-sky-600 disabled:opacity-60"><Save className="h-4 w-4" /> 儲存設定</button>
    );

    return (
        <AdminLayout title="網站設定" actions={actions}>
            <form id="settings-form" onSubmit={submit} className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <Card title="基本資訊" icon={Building2}>
                    <div>
                        <label className={labelCls}><Building2 className="h-4 w-4 text-slate-400" /> 網站名稱</label>
                        <input className={inputCls} value={data.settings.site_name ?? ''} onChange={(e) => set('site_name', e.target.value)} />
                    </div>
                    <div>
                        <label className={labelCls}>頁尾簡介文字</label>
                        <textarea rows={3} className={inputCls} value={data.settings.footer_tagline ?? ''} onChange={(e) => set('footer_tagline', e.target.value)} placeholder="商業落地的技術夥伴。從系統開發、網頁 App 到場域整合…" />
                        <p className={helpCls}>顯示在前台頁尾左側 Logo 下方。</p>
                    </div>
                    <div>
                        <label className={labelCls}>頁尾版權文字</label>
                        <input className={inputCls} value={data.settings.footer_copyright ?? ''} onChange={(e) => set('footer_copyright', e.target.value)} placeholder="© {year} 宸揚資科 JWisdom. All rights reserved." />
                        <p className={helpCls}>顯示在頁尾最下方。可用 <span className="font-mono">{'{year}'}</span> 代表當年年份（自動更新）。</p>
                    </div>
                    <div>
                        <label className={labelCls}><Search className="h-4 w-4 text-slate-400" /> 首頁 SEO 描述</label>
                        <textarea rows={3} className={inputCls} value={data.settings.home_meta_description ?? ''} onChange={(e) => set('home_meta_description', e.target.value)} placeholder="顯示在 Google 搜尋結果與社群分享的首頁描述，約 80–120 字。留空用預設。" />
                        <p className={helpCls}>影響首頁在 Google 搜尋結果與分享卡片的描述文字（meta description / og:description）。</p>
                    </div>
                    <div>
                        <label className={labelCls}>社群分享預設圖（og:image）</label>
                        {data.settings.og_image && <div className="mb-2 overflow-hidden rounded-lg border border-slate-200"><img src={data.settings.og_image} alt="" className="max-h-32 w-full object-cover" /></div>}
                        <div className="flex gap-2">
                            <input className={inputCls} value={data.settings.og_image ?? ''} onChange={(e) => set('og_image', e.target.value)} placeholder="建議 1200×630，分享到 FB/LINE 時顯示的圖" />
                            <ImageUploadButton onUploaded={(url) => set('og_image', url)} label="上傳" />
                        </div>
                        <p className={helpCls}>分享連結到社群／顯示在搜尋結果時的縮圖；建議尺寸 1200×630。文章會優先用自己的封面圖。</p>
                    </div>
                </Card>

                <Card title="聯絡資訊" icon={Mail}>
                    {contactKeys.map((k) => {
                        const m = meta[k] ?? { label: k, icon: Mail };
                        return (
                            <div key={k}>
                                <label className={labelCls}><m.icon className="h-4 w-4 text-slate-400" /> {m.label}</label>
                                <input className={inputCls} value={data.settings[k] ?? ''} onChange={(e) => set(k, e.target.value)} placeholder={m.placeholder} />
                                {k === 'contact_map_query' && <p className={helpCls}>會用於 /contact 的 Google 地圖；改了地圖會跟著更新。</p>}
                            </div>
                        );
                    })}
                </Card>

                <div className="xl:col-span-2">
                    <Card title="社群連結" icon={Share2}>
                        <p className={helpCls}>填入完整網址（含 https://）即會在頁尾顯示對應 icon；留空則該 icon 不顯示。</p>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                            {[
                                { k: 'social_facebook', label: 'Facebook', ph: 'https://www.facebook.com/yourpage' },
                                { k: 'social_instagram', label: 'Instagram', ph: 'https://www.instagram.com/yourpage' },
                                { k: 'social_threads', label: 'Threads', ph: 'https://www.threads.net/@yourpage' },
                                { k: 'social_youtube', label: 'YouTube', ph: 'https://www.youtube.com/@yourchannel' },
                                { k: 'social_tiktok', label: 'TikTok', ph: 'https://www.tiktok.com/@yourpage' },
                            ].map(({ k, label, ph }) => (
                                <div key={k}>
                                    <label className="mb-1 block text-xs font-semibold text-slate-500">{label}</label>
                                    <input className={inputCls} value={data.settings[k] ?? ''} onChange={(e) => set(k, e.target.value)} placeholder={ph} />
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <div className="xl:col-span-2">
                    <Card title="聯絡頁 LINE QR Code" icon={QrCode}>
                        <p className={helpCls}>顯示在 /contact 頁面「服務時間」下方。留空則不顯示這張卡片。</p>
                        <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
                            <div className="flex flex-col items-center gap-2">
                                {data.settings.line_qr_image ? (
                                    <img src={data.settings.line_qr_image} alt="QR 預覽" className="h-40 w-40 rounded-xl border border-slate-200 bg-white object-contain p-2" />
                                ) : (
                                    <div className="flex h-40 w-40 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-400">尚未上傳</div>
                                )}
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className={labelCls}>QR 圖片網址</label>
                                    <div className="flex gap-2">
                                        <input className={inputCls} value={data.settings.line_qr_image ?? ''} onChange={(e) => set('line_qr_image', e.target.value)} placeholder="/images/line-qr.png" />
                                        <ImageUploadButton onUploaded={(url) => set('line_qr_image', url)} label="上傳" />
                                    </div>
                                    <p className={helpCls}>建議方形 PNG，邊長 500px 以上。</p>
                                </div>
                                <div>
                                    <label className={labelCls}>顯示文字</label>
                                    <input className={inputCls} value={data.settings.line_qr_label ?? ''} onChange={(e) => set('line_qr_label', e.target.value)} placeholder="加入官方 LINE" />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="xl:col-span-2">
                    <Card title="首頁數據統計" icon={BarChart3}>
                        <p className={helpCls}>首頁服務區下方那排數字（數值可含 + 或 %，例如 15+、98%）。</p>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {statRows.map(({ i, valueKey, labelKey }) => (
                                <div key={i} className="rounded-xl border border-slate-200 p-4">
                                    <label className="mb-1 block text-xs font-semibold text-slate-500">數值 {i}</label>
                                    <input className={inputCls} value={data.settings[valueKey] ?? ''} onChange={(e) => set(valueKey, e.target.value)} placeholder={statPlaceholders[i][0]} />
                                    <label className="mb-1 mt-3 block text-xs font-semibold text-slate-500">說明文字</label>
                                    <input className={inputCls} value={data.settings[labelKey] ?? ''} onChange={(e) => set(labelKey, e.target.value)} placeholder={statPlaceholders[i][1]} />
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </form>
        </AdminLayout>
    );
}
