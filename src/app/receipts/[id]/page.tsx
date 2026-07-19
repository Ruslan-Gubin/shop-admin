import Link from "next/link";
import { Button } from "@/shared/ui/button-main/Button";
import { ErrorAlert } from "@/shared/ui/error-alert/ErrorAlert";
import { PageHeader } from "@/shared/ui/page-header/PageHeader";
import { UpdateToken } from "@/views/UpdateToken/UpdateToken";
import { FormSection } from "@/widgets/form-section/FormSection";
import { fetchReceiptDetail } from "./action";
import { ReceiptProductsTable } from "./components/ReceiptProductsTable/ReceiptProductsTable";
import styles from "./page.module.css";

export default async function ReceiptDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;

  const [receiptData, warehousesData] = await fetchReceiptDetail(id);

  const receipt = receiptData.data?.receipt || null;
  const productInfo = receiptData.data?.productInfo || {};
  const warehouses = warehousesData.data?.warehouses || [];

  const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const totalProducts = receipt?.products.length || 0;
  const totalQuantity =
    receipt?.products.reduce((sum, p) => {
      const qty = Object.values(p.stocks).reduce((a, b) => a + b, 0);
      return sum + qty;
    }, 0) || 0;

  return (
    <section className="page-wrapper">
      {warehousesData?.tokens && <UpdateToken tokens={warehousesData.tokens} />}
      <PageHeader title="Поступление" />

      {receiptData.status === "error" && receiptData.message && (
        <ErrorAlert message={receiptData.message} />
      )}
      {warehousesData.status === "error" && warehousesData.message && (
        <ErrorAlert message={warehousesData.message} />
      )}

      {receipt && (
        <div className={styles.content}>
          <FormSection title="Общие данные">
            <div className={styles.fields}>
              <p className={styles.fieldValue}>
                <span className={styles.fieldLabel}>Дата создания: </span>
                {dateFormatter.format(new Date(receipt.created_at))}
              </p>
              <p className={styles.fieldValue}>
                <span className={styles.fieldLabel}>Всего товаров: </span>
                {totalQuantity} шт
              </p>
              <p className={styles.fieldValue}>
                <span className={styles.fieldLabel}>Всего позиций: </span>
                {totalProducts}
              </p>
              {receipt.user_id && (
                <Link href={`/users/info/${receipt.user_id}`}>
                  <Button variant="link" variantColor="blue">
                    Оформил
                  </Button>
                </Link>
              )}
            </div>
          </FormSection>

          <div className={styles.productsSection}>
            <h2 className={styles.productsTitle}>Список товаров</h2>
            <ReceiptProductsTable
              products={receipt.products}
              productInfo={productInfo}
              warehouses={warehouses}
            />
          </div>
        </div>
      )}
    </section>
  );
}
