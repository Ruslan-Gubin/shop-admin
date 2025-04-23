import { AddProductForm } from "@/widgets/products/add-product-form/AddProductForm";
import styles from "../../../styles/pages/Home.module.scss";
import { CONFIG_APP } from "@/shared/config/config";

const fetchData = async (id: string) => {
  try {
    const url = `${CONFIG_APP.BACKEND_URL}product/${id}`;
    const response = await fetch(url);
    return response.json();
  } catch {
    throw new Error("Не удалось получить данные продукта");
  }
};

const ProductEditPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const product = await fetchData(id);

  const submitForm = async (payload: {
    name: string;
    count: string;
    price: string;
    code: string;
    id?: string;
  }): Promise<{ status: "error" | "success"; message: string }> => {
    "use server";
    const { id, ...rest } = payload;

    return new Promise((resolve) => {
      const url = `${CONFIG_APP.BACKEND_URL}product/${id}`;

      fetch(url, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "PATCH",
        body: JSON.stringify(rest),
      })
        .then((res) => res.json())
        .then((res) => resolve({ status: res.status, message: res.message }))
        .catch((error) => resolve({ status: "error", message: error.message }));
    });
  };

  return (
    <div>
      <div className={styles.root}>
        {product && (
          <AddProductForm
            submitForm={submitForm}
            initValue={{
              name: product.name,
              code: String(product.code),
              count: String(product.count),
              price: String(product.price),
              id,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ProductEditPage;
