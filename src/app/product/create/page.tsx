import { AddProductForm } from "@/widgets/products/add-product-form/AddProductForm";
import { createProductAction } from "./action";
import styles from "./CreateProduct.module.css";

export default function CreateProductPage() {
  return (
    <div className={styles.root}>
      <AddProductForm submitFormAction={createProductAction} />
    </div>
  );
}
