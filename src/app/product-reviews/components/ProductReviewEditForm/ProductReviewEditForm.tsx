"use client";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { Button } from "@/shared/ui/button-main/Button";
import { TextAreaResize } from "@/shared/ui/text-area-resize/TextAreaResize";
import { notificationAdapter } from "@/stores/notification/adapter";
import { ModalDelete } from "@/widgets/modals/modal-delete/ModalDelete";
import type { ReviewModel } from "../../action";
import styles from "./ProductReviewEditForm.module.css";

type Props = {
  review: ReviewModel;
  submitAction: (payload: { answer: string }) => Promise<{
    errors: Record<string, string> | null;
    notification: { status: "error" | "success"; message: string } | null;
  }>;
  deleteAction: () => Promise<void>;
  initErrors: { answer: string };
  initValues: { answer: string };
};

export const ProductReviewEditForm = (props: Props) => {
  const [submitLoading, transition] = useTransition();
  const [deleteLoading, deleteTransition] = useTransition();
  const [errors, setErrors] = useState(props.initErrors);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [answer, setAnswer] = useState<string>(props.initValues.answer);

  const handleSubmit = () => {
    transition(() => {
      props.submitAction({ answer: answer.trim() }).then((res) => {
        if (res.notification) {
          notificationAdapter.add(res.notification.message, res.notification.status);
        }

        if (res.errors) {
          setErrors({ answer: res.errors.answer || "" });
        }

        if (res.notification?.status === "success") {
          setErrors({ answer: "" });
        }
      });
    });
  };

  const handleDelete = () => {
    deleteTransition(() => {
      props.deleteAction().then(() => {
        notificationAdapter.add("Отзыв удален", "success");
      });
    });
  };

  const ratingArray = [1, 2, 3, 4, 5];

  return (
    <>
      <ModalDelete
        submit={handleDelete}
        title="Действительно хотите удалить отзыв?"
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        disabled={deleteLoading}
        showSubTitle={true}
      />

      <h2>Редактировать отзыв</h2>

      <section className={styles.productInfo}>
        <h3>Информация о товаре</h3>
        {props.review?.product?.code && (
          <p>
            <strong>Штрих-код:</strong> {props.review.product.code}
          </p>
        )}
        {props.review?.product?.name && (
          <p>
            <strong>Название:</strong> {props.review.product.name}
          </p>
        )}
        {props.review?.product?.description && (
          <p>
            <strong>Описание:</strong> {props.review.product.description}
          </p>
        )}

        {props.review.create_user_id && (
          <Link href={`/users/info/${props.review.create_user_id}`}>
            <Button variant="link" variantColor="blue">
              Информация о пользователе
            </Button>
          </Link>
        )}

        {props.review?.product?.id && (
          <Link href={`/product/info/${props.review.product.id}`}>
            <Button variant="link" variantColor="blue">
              Перейти к карточке товара
            </Button>
          </Link>
        )}
      </section>

      <section className={styles.reviewSection}>
        <h3>Отзыв</h3>
        {props.review.rating && (
          <ul className={styles.ratingList}>
            {ratingArray.slice(0, props.review.rating).map((item) => (
              <li key={item}>⭐</li>
            ))}
          </ul>
        )}

        {props.review.dignities && (
          <div className={styles.fieldBlock}>
            <p>
              <strong>Достоинства: </strong> {props.review.dignities}
            </p>
          </div>
        )}

        {props.review.disadvantages && (
          <div className={styles.fieldBlock}>
            <p>
              <strong>Недостатки: </strong>
              {props.review.disadvantages}
            </p>
          </div>
        )}

        {props.review.comment && (
          <div className={styles.fieldBlock}>
            <p>
              <strong>Комментарий: </strong>
              {props.review.comment}
            </p>
          </div>
        )}
      </section>

      <form ref={formRef} action={handleSubmit} className={styles.form}>
        <div className={styles.fieldGroup}>
          <TextAreaResize
            error={errors.answer}
            name="answer"
            onChange={(value) => setAnswer(value)}
            value={answer}
            label="Ответ"
          />
        </div>

        <div className={styles.actions}>
          <Button type="submit" variantColor="green" disabled={submitLoading}>
            Сохранить
          </Button>
          <Button
            type="button"
            variantColor="error"
            variant="outline"
            onClick={() => setShowDeleteModal(true)}
            disabled={deleteLoading}
          >
            Удалить отзыв
          </Button>
        </div>
      </form>
    </>
  );
};
