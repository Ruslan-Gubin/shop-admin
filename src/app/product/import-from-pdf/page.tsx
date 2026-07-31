import { ImportForm } from "./components/ImportForm/ImportForm";
import styles from "./page.module.css";

export default function ImportFromPdfPage() {
  return (
    <section className="page-wrapper">
      <h2>Импорт товаров из PDF</h2>

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
