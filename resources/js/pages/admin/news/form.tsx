import ContentForm, { type ContentItem } from '@/components/admin/content-form';

export default function NewsForm({ item, categories }: { item: ContentItem | null; categories?: string[] }) {
    return <ContentForm item={item} kind="news" categories={categories} />;
}
