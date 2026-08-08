"use client";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { Button } from "@/shared/ui/button-main/Button";
import { InputTextarea } from "@/shared/ui/input-textarea/InputTextarea";
import { notificationAdapter } from "@/stores/notification/adapter";
import { AiSvg } from "@/shared/svg/AiSvg";
import { ModalDelete } from "@/widgets/modals/modal-delete/ModalDelete";
import { AnswerSuggestionModal } from "@/widgets/answer-suggestion-modal/AnswerSuggestionModal";
import { type AnswerSuggestionPayload, type ReviewModel } from "../../action";
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
  generateAnswerAction: (payload: AnswerSuggestionPayload) => Promise<{
    notification: { status: "error" | "success"; message: string } | null;
    answer: string;
  }>;
};

export const ProductReviewEditForm = (props: Props) => {
  const [submitLoading, transition] = useTransition();
  const [generateLoading, generateTransition] = useTransition();
  const [deleteLoading, deleteTransition] = useTransition();
  const [errors, setErrors] = useState(props.initErrors);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
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

  const handleGenerate = () => {
    const reviewId = props.review?.id;

    if (!reviewId) {
      notificationAdapter.add("Не удалось сгенерировать ответ: отзыв не указан", "error");
      return;
    }

    generateTransition(() => {
      const payload = {
        review_id: reviewId,
        context: answer.trim() || "",
      };

      props.generateAnswerAction(payload).then((response) => {
        if (response.answer) {
          setSuggestion(response.answer);
          setIsModalOpen(true);
        } else if (response.notification) {
          notificationAdapter.add(response.notification.message, response.notification.status);
        }
      });
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSuggestion(null);
  };

  const handleApplyAnswer = (value: string) => {
    setAnswer(value);
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

      <AnswerSuggestionModal
        isOpen={isModalOpen}
        subject={props.review.comment || props.review.dignities || props.review.disadvantages}
        subjectLabel="Отзыв"
        fieldTitle="Ответ на отзыв"
        suggestion={suggestion || ""}
        currentValue={answer}
        onClose={handleCloseModal}
        onApply={handleApplyAnswer}
      />

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
        <Button
          type="button"
          variant="solid"
          variantColor="blue"
          size="sm"
          onClick={handleGenerate}
          disabled={submitLoading || generateLoading || !props.review?.id}
        >
          <div className="buttonContentIcon">
            <div>{generateLoading ? <div className="spinner" /> : <AiSvg />}</div>
            <p>Сгенерировать ответ</p>
          </div>
        </Button>

        <div className={styles.fieldGroup}>
          <InputTextarea
            variantSize="md"
            error={errors.answer}
            name="answer"
            onChange={(value) => setAnswer(value)}
            value={answer}
            label="Ответ"
          />
        </div>

        <div className={styles.actions}>
          <Button type="submit" variantColor="green" disabled={submitLoading || generateLoading}>
            Сохранить
          </Button>
          <Button
            type="button"
            variantColor="error"
            variant="outline"
            onClick={() => setShowDeleteModal(true)}
            disabled={deleteLoading || generateLoading || submitLoading}
          >
            Удалить отзыв
          </Button>
        </div>
      </form>
    </>
  );
};
