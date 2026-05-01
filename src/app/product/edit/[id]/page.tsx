import { ErrorAlert } from "@/shared/ui/error-alert/ErrorAlert";
import { UpdateToken } from "@/views/UpdateToken/UpdateToken";
import { AddProductForm } from "@/widgets/products/add-product-form/AddProductForm";
import { fetchProduct, updateProductAction } from "./action";
import styles from "./EditProduct.module.css";

export default async function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await fetchProduct(id);

  return (
    <div>
      {product?.tokens && <UpdateToken tokens={product.tokens} />}
      {product.status === "error" && product.message && <ErrorAlert message={product.message} />}
      <div className={styles.root}>
        {product?.data && (
          <AddProductForm
            //@ts-ignore
            submitFormAction={updateProductAction}
            initValue={{
              name: product.data.name,
              code: product.data.code,
              count: String(product.data.count),
              price: String(product.data.price),
              id,
            }}
          />
        )}
      </div>
    </div>
  );
}
