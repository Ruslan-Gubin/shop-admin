import { AddProductForm } from "@/widgets/products/add-product-form/AddProductForm";
import styles from "../../styles/pages/Home.module.scss";
import { CONFIG_APP } from "@/shared/config/config";

const CreateProductPage = () => {
  const submitForm = async (payload: {
    name: string;
    count: string;
    price: string;
  }): Promise<{ status: "error" | "success"; message: string }> => {
    "use server";

    return new Promise((resolve) => {
      const url = `${CONFIG_APP.BACKEND_URL}product/create`;

      fetch(url, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then((res) => resolve({ status: res.status, message: res.message }))
        .catch((error) => resolve({ status: "error", message: error.message }));
    });
  };

  return (
    <div className={styles.root}>
      <AddProductForm submitForm={submitForm} />
    </div>
  );
};

export default CreateProductPage;
