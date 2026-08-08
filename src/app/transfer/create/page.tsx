import { PageHeader } from "@/shared/ui/page-header/PageHeader";

export default async function TransferCreatePage() {
  return (
    <section className="page-wrapper">
      <PageHeader title="Создание перемещения" fallbackHref="/transfer" />
      <p className="empty-table-message">Страница в разработке</p>
    </section>
  );
}
