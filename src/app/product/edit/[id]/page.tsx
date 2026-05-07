import { fetchPriceAutoFillPageData } from "@/app/price-auto-fill/action";
import { ErrorAlert } from "@/shared/ui/error-alert/ErrorAlert";
import { UpdateToken } from "@/views/UpdateToken/UpdateToken";
import { ProductForm } from "../../components/ProductForm/ProductForm";
import { fetchProduct, updateProductAction } from "./action";
import styles from "./EditProduct.module.css";

export default async function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await fetchProduct(id);
  const [rangesData, priceTypesData, priceFill] = await fetchPriceAutoFillPageData();

  return (
    <div>
      {product?.tokens && <UpdateToken tokens={product.tokens} />}
      {product.status === "error" && product.message && <ErrorAlert message={product.message} />}
      <div className={styles.root}>
        {product?.data && (
          <ProductForm
            priceTypes={priceTypesData.data?.priceTypes || []}
            submitFormAction={updateProductAction}
            initValue={{
              name: product.data.name,
              code: product.data.code,
              count: String(product.data.count),
              price: String(product.data.price),
              id: Number(id),
            }}
          />
        )}
      </div>
    </div>
  );
}
