import { PageHeader } from "@/shared/ui/page-header/PageHeader";
import { ImportForm } from "./components/ImportForm/ImportForm";
import styles from "./page.module.css";

export default function ImportFromPdfPage() {
  return (
    <section className="page-wrapper">
      <PageHeader title="Импорт товаров из PDF" fallbackHref="/product" />

      <section className={styles.rules}>
        <p>
          Формат файла: <strong>.pdf</strong>
        </p>
        <p>
          В PDF обязательно должны быть колонки: <strong>Наименование</strong>,{" "}
          <strong>Цена</strong>, <strong>Штрих-коды</strong>
        </p>
      </section>

      <ImportForm />
    </section>
  );
}
