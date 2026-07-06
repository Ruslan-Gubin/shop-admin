"use client";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { Button } from "@/shared/ui/button-main/Button";
import { TextAreaResize } from "@/shared/ui/text-area-resize/TextAreaResize";
import { notificationAdapter } from "@/stores/notification/adapter";
import { ModalDelete } from "@/widgets/modals/modal-delete/ModalDelete";
import type { QuestionModel } from "../../action";
import styles from "./ProductQuestionEditForm.module.css";

type Props = {
  question: QuestionModel;
  submitAction: (payload: { answer: string }) => Promise<{
    errors: Record<string, string> | null;
    notification: { status: "error" | "success"; message: string } | null;
  }>;
  deleteAction: () => Promise<void>;
  initErrors: { answer: string };
  initValues: { answer: string };
};

export const ProductQuestionEditForm = (props: Props) => {
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
        notificationAdapter.add("Вопрос удален", "success");
      });
    });
  };

  return (
    <>
      <ModalDelete
        submit={handleDelete}
        title="Действительно хотите удалить вопрос?"
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        disabled={deleteLoading}
        showSubTitle={true}
      />

      <h2>Редактировать вопрос</h2>

      <section className={styles.productInfo}>
        <h3>Информация о товаре</h3>
        {props.question?.product?.code && (
          <p>
            <strong>Штрих-код:</strong> {props.question.product.code}
          </p>
        )}
        {props.question?.product?.name && (
          <p>
            <strong>Название:</strong> {props.question.product.name}
          </p>
        )}
        {props.question?.product?.description && (
          <p>
            <strong>Описание:</strong> {props.question.product.description}
          </p>
        )}

        {props.question?.product?.id && (
          <Link href={`/product/edit/${props.question.product.id}`}>
            <Button variant="link" variantColor="blue">
              Перейти к каточке товара
            </Button>
          </Link>
        )}
      </section>

      <section className={styles.questionSection}>
        <h3>Вопрос</h3>
        <p>{props.question.question}</p>
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
            {submitLoading ? "Сохранение..." : "Сохранить"}
          </Button>
          <Button
            type="button"
            variantColor="error"
            variant="outline"
            onClick={() => setShowDeleteModal(true)}
            disabled={deleteLoading}
          >
            Удалить вопрос
          </Button>
        </div>
      </form>
    </>
  );
};
