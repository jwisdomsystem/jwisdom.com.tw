import { Link } from '@inertiajs/react';
import { Pencil, FileText, ExternalLink } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { IconBtn } from '@/components/admin/ui';

type Item = { id: number; key: string; title: string };
const keyLabel: Record<string, string> = { about: '公司介紹', terms: '使用者條款', privacy: '隱私權保護' };

export default function PagesIndex({ items }: { items: Item[] }) {
    return (
        <AdminLayout title="頁面內容">
            <div className="mb-4 flex items-center gap-2 text-sm text-slate-500"><FileText className="h-4 w-4 text-sky-500" /> 固定頁面內容（公司介紹／條款／隱私）</div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full min-w-[480px] text-left text-sm">
                    <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                        <tr><th className="px-5 py-3.5 font-semibold">頁面</th><th className="px-5 py-3.5 font-semibold">網址</th><th className="w-28 px-5 py-3.5 text-right font-semibold">操作</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {items.map((p) => (
                            <tr key={p.id} className="group transition hover:bg-sky-50/40">
                                <td className="px-5 py-3.5 font-semibold text-slate-900">{keyLabel[p.key] ?? p.title}</td>
                                <td className="px-5 py-3.5 text-slate-500">/{p.key}</td>
                                <td className="px-5 py-3.5">
                                    <div className="flex items-center justify-end gap-0.5">
                                        <IconBtn as="a" href={`/${p.key}`} target="_blank" title="檢視前台"><ExternalLink className="h-4 w-4" /></IconBtn>
                                        <Link href={`/admin/pages/${p.key}/edit`} title="編輯" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-sky-100 hover:text-sky-600"><Pencil className="h-4 w-4" /></Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
