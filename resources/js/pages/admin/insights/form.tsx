import ContentForm, { type ContentItem } from '@/components/admin/content-form';

export default function InsightForm({ item, categories }: { item: ContentItem | null; categories?: string[] }) {
    return <ContentForm item={item} kind="insight" categories={categories} />;
}
