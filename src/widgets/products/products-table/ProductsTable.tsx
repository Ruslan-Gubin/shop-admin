"use client";
import { TableEditSvg } from "@/shared/svg/table/TableEdit";
import styles from "./ProductsTable.module.scss";
import Link from "next/link";
import { TableDeleteSvg } from "@/shared/svg/table/TableDeleteSvg";
import { useState, useTransition } from "react";
import { ModalDelete } from "@/widgets/modals/modal-delete/ModalDelete";
import { notificationService } from "@/shared/services/notification";

const tableHeaderLabels = [
  "ID",
  "Название",
  "Количество",
  "Цена",
  "Штриховой код",
  "Дата регистрации",
  "",
  "",
];

type Props = {
  products: {
    id: number;
    name: string;
    price: number;
    count: number;
    code: string;
    created_at: string;
  }[];
  onDeleteProduct: (
    id: number,
  ) => Promise<{ status: "error" | "success"; message: string }>;
};

const ProductsTable = ({ products, onDeleteProduct }: Props) => {
  const [submitLoading, transition] = useTransition();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleOpenDeleteModal = (id: number) => setDeleteId(id);
  const closeModal = () => setDeleteId(null);

  const submitDelete = () => {
    if (!deleteId) return;

    transition(async () => {
      await onDeleteProduct(deleteId).then((res) => {
        notificationService.activeNotification({
          status: res.status,
          message: res.message,
        });
        closeModal();
      });
    });
  };

  return (
    <>
      <ModalDelete
        submit={submitDelete}
        title="Действительно хотите удалить?"
        isOpen={typeof deleteId === "number"}
        onClose={closeModal}
        disabled={submitLoading}
        showSubTitle={true}
      />
      <section className={styles.root}>
        <ul className={styles.tableHeader}>
          {tableHeaderLabels.map((label, index) => (
            <li className={styles.tableHeaderLabel} key={index}>
              {label}
            </li>
          ))}
        </ul>

        <ul className={styles.table}>
          {products.map((product) => (
            <li key={product.id} className={styles.tableRow}>
              <div className={styles.tableRowItem}>
                {product.id ? product.id : "---"}
              </div>
              <div className={styles.tableRowItem}>
                {product.name ? product.name : "---"}
              </div>
              <div className={styles.tableRowItem}>
                {product.count ? product.count : "---"}
              </div>
              <div className={styles.tableRowItem}>
                {product.price ? product.price : "---"}
              </div>
              <div className={styles.tableRowItem}>
                {product.code ? product.code : "---"}
              </div>
              <div className={styles.tableRowItem}>
                {product.created_at
                  ? new Date(product.created_at).toLocaleString()
                  : "---"}
              </div>
              <Link href={`/product/edit/${product.id}`}>
                <div className={styles.tableRowItem}>
                  <TableEditSvg />
                </div>
              </Link>
              <div
                onClick={() => handleOpenDeleteModal(product.id)}
                className={`${styles.tableRowItem} ${styles.tableRowItemDelete}`}
              >
                <TableDeleteSvg />
                {/* <TableActionInfoSvg /> */}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
};

export { ProductsTable };
