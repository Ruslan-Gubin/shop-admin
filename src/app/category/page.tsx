"use server";
import { ErrorAlert } from "@/shared/ui/error-alert/ErrorAlert";
import { PageHeader } from "@/shared/ui/page-header/PageHeader";
import { UpdateToken } from "@/views/UpdateToken/UpdateToken";
import {
  createCategoryAction,
  deleteCategoryAction,
  fetchCategories,
  sortCategoryAction,
  updateCategoryAction,
} from "./action";
import styles from "./CategoriesPage.module.css";
import { CategoryList } from "./components/category-list/CategoryList";

export default async function CategoriesPage() {
  const tableData = await fetchCategories();

  return (
    <section className="page-wrapper">
      {tableData?.tokens && <UpdateToken tokens={tableData.tokens} />}
      <PageHeader title="Справочник категорий." />
      {tableData.status === "error" && tableData.message && (
        <ErrorAlert message={tableData.message} />
      )}

      <div className={styles.root}>
        {tableData && (
          <CategoryList
            onDeleteItemAction={deleteCategoryAction}
            createCategoryAction={createCategoryAction}
            updateCategoryAction={updateCategoryAction}
            sortCategoryAction={sortCategoryAction}
            categories={tableData.data || []}
          />
        )}
      </div>
    </section>
  );
}
