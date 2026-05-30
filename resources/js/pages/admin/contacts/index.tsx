import { Link, router } from '@inertiajs/react';
import { Mail, Phone, Building2, MailOpen, Trash2, CornerUpLeft } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';

type Contact = { id: number; name: string; email: string; phone?: string; company?: string; subject?: string; message: string; is_read: boolean; created_at?: string };
type Paginated = { data: Contact[]; total: number; links: { url: string | null; label: string; active: boolean }[] };

export default function ContactsIndex({ contacts, unread }: { contacts: Paginated; unread: number }) {
    const toggleRead = (id: number) => router.patch(`/admin/contacts/${id}/read`, {}, { preserveScroll: true });
    const remove = (id: number) => { if (confirm('確定刪除這則聯絡訊息？')) router.delete(`/admin/contacts/${id}`, { preserveScroll: true }); };

    const actions = (
        <div className="flex items-center gap-2 text-sm">
            {unread > 0 ? <span className="rounded-full bg-rose-100 px-3 py-1 font-bold text-rose-600">{unread} 則未讀</span> : <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-600">全部已讀</span>}
        </div>
    );

    return (
        <AdminLayout title="聯絡訊息" actions={actions}>
            <div className="mb-4 flex items-center gap-2 text-sm text-slate-500"><Mail className="h-4 w-4 text-sky-500" /> 共 <span className="font-bold text-slate-700">{contacts.total}</span> 則來信</div>
            {contacts.data.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center text-slate-400">目前沒有聯絡訊息。</div>
            ) : (
                <div className="space-y-4">
                    {contacts.data.map((c) => (
                        <div key={c.id} className={cn('rounded-2xl border bg-white p-5 shadow-sm transition', c.is_read ? 'border-slate-200' : 'border-sky-300 ring-1 ring-sky-100')}>
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-900">{c.name}</span>
                                        {!c.is_read && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-600">未讀</span>}
                                    </div>
                                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                                        <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1 text-sky-600 hover:underline"><Mail className="h-3.5 w-3.5" />{c.email}</a>
                                        {c.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5 text-slate-400" />{c.phone}</span>}
                                        {c.company && <span className="inline-flex items-center gap-1"><Building2 className="h-3.5 w-3.5 text-slate-400" />{c.company}</span>}
                                    </div>
                                </div>
                                <span className="shrink-0 text-xs text-slate-400">{c.created_at}</span>
                            </div>
                            {c.subject && <div className="mt-3 font-semibold text-slate-800">{c.subject}</div>}
                            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{c.message}</p>
                            <div className="mt-4 flex flex-wrap gap-2 text-sm">
                                <button onClick={() => toggleRead(c.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-600 transition hover:bg-slate-50"><MailOpen className="h-4 w-4" />{c.is_read ? '標記未讀' : '標記已讀'}</button>
                                <a href={`mailto:${c.email}?subject=${encodeURIComponent('回覆：' + (c.subject || '您的來信'))}`} className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 font-medium text-sky-600 transition hover:bg-sky-100"><CornerUpLeft className="h-4 w-4" />回覆</a>
                                <button onClick={() => remove(c.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 font-medium text-rose-600 transition hover:bg-rose-50"><Trash2 className="h-4 w-4" />刪除</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {contacts.links.length > 3 && (
                <div className="mt-6 flex flex-wrap gap-2">
                    {contacts.links.map((l, i) => <Link key={i} href={l.url ?? '#'} preserveScroll className={cn('rounded-lg border px-3 py-1.5 text-sm transition', l.active ? 'border-sky-500 bg-sky-500 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-sky-300', !l.url && 'pointer-events-none opacity-40')} dangerouslySetInnerHTML={{ __html: l.label }} />)}
                </div>
            )}
        </AdminLayout>
    );
}
