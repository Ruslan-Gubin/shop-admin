import { HorizontalScrollWrapper } from "@/shared/ui/horizontal-scroll-wrapper/HorizontalScrollWrapper";
import styles from "./styles/pages/Home.module.scss";
import { PaginationSection } from "@/shared/ui/pagination-section/PaginationSection";
import { ProductsTable } from "@/widgets/products/products-table/ProductsTable";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { CONFIG_APP } from "@/shared/config/config";

const fetchProducts = async (page?: number) => {
  const url = `${CONFIG_APP.BACKEND_URL}product/products?page=${page ? page : 1}&limit=10`;
  try {
    const response = await fetch(url, {
      next: {
        tags: ["products"],
      },
    });

    if (!response.ok) {
      return {
        message: "Не удалось получить данные",
        data: {
          products: null,
          totalCount: 0,
          paginationNumbers: 0,
        },
        status: "error",
      };
    }

    return await response.json();
  } catch {
    return {
      message: "Не удалось получить данные",
      data: {
        products: null,
        totalCount: 0,
        paginationNumbers: 0,
      },
      status: "error",
    };
  }
};

const HomePage = async (req: { searchParams: Promise<{ page: string }> }) => {
  const { page } = await req.searchParams;
  const productsData = await fetchProducts(parseInt(page));

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
      {productsData.data.products && productsData.data.products.length && (
        <HorizontalScrollWrapper>
          <ProductsTable
            products={productsData.data.products}
            onDeleteProduct={onDeleteProduct}
          />
        </HorizontalScrollWrapper>
      )}
      {productsData.data.totalCount > 10 && (
        <PaginationSection
          page={Number(productsData.data.paginationPage)}
          limit={10}
          total={productsData.data.totalCount}
          onChangePage={onChangePageServer}
        />
      )}
    </div>
  );
};

export default HomePage;
