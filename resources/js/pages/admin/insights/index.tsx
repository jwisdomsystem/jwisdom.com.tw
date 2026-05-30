import ContentList, { type ListItem } from '@/components/admin/content-list';

type Paginated = { data: ListItem[]; total: number; from: number; to: number; links: { url: string | null; label: string; active: boolean }[] };
type Filters = { q: string; status: string; category: string; sort: string };

export default function InsightsIndex({ items, categories, filters }: { items: Paginated; categories: string[]; filters: Filters }) {
    return <ContentList kind="insight" items={items} categories={categories} filters={filters} />;
}
