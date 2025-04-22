import { HorizontalScrollWrapper } from "@/shared/ui/horizontal-scroll-wrapper/HorizontalScrollWrapper";
import styles from "./styles/pages/Home.module.scss";
import { CONFIG_APP } from "@/shared/constants/config";
import { PaginationSection } from "@/shared/ui/pagination-section/PaginationSection";
import { ProductsTable } from "@/widgets/products/products-table/ProductsTable";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

const fetchProducts = async (page?: number) => {
  try {
    const url = `${CONFIG_APP.BACKEND_URL}product/products?page=${page ? page : 1}&limit=10`;
    const response = await fetch(url, {
      next: {
        tags: ["products"],
        // revalidate: 60,
      },
      // cache: "default",
    });
    return await response.json();
  } catch {
    throw new Error("Не удалось получить данные продукта");
  }
};

const HomePage = async (req: { searchParams: Promise<{ page: string }> }) => {
  const { page } = await req.searchParams;

  const {
    data: { products, totalCount, paginationPage },
  } = await fetchProducts(parseInt(page));

  const onDeleteProduct = async (
    id: number,
  ): Promise<{ status: "error" | "success"; message: string }> => {
    "use server";

    return new Promise((resolve) => {
      const url = `${CONFIG_APP.BACKEND_URL}product/${id}`;
      fetch(url, { method: "DELETE" })
        .then((res) => res.json())
        .then((res: { message: string; status: "error" | "success" }) => {
          revalidateTag("products");
          resolve({ status: res.status, message: res.message });
        })
        .catch(() =>
          resolve({ status: "error", message: "Не удалось удалить товар" }),
        );
    });
  };

  const onChangePageServer = async (page: number) => {
    "use server";
    redirect(`/?page=${page}`);
  };

  return (
    <div className={styles.root}>
      <HorizontalScrollWrapper>
        <ProductsTable products={products} onDeleteProduct={onDeleteProduct} />
      </HorizontalScrollWrapper>
      {totalCount > 10 && (
        <PaginationSection
          page={Number(paginationPage)}
          limit={10}
          total={totalCount}
          onChangePage={onChangePageServer}
        />
      )}
    </div>
  );
};

export default HomePage;
