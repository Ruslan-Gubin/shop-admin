"use client";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { AiSvg } from "@/shared/svg/AiSvg";
import { Button } from "@/shared/ui/button-main/Button";
import { InputTextarea } from "@/shared/ui/input-textarea/InputTextarea";
import { notificationAdapter } from "@/stores/notification/adapter";
import { ModalDelete } from "@/widgets/modals/modal-delete/ModalDelete";
import { AnswerSuggestionModal } from "@/widgets/answer-suggestion-modal/AnswerSuggestionModal";
import { type AnswerSuggestionPayload, type QuestionModel } from "../../action";
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
  generateAnswerAction: (payload: AnswerSuggestionPayload) => Promise<{
    notification: { status: "error" | "success"; message: string } | null;
    answer: string;
  }>;
};

export const ProductQuestionEditForm = (props: Props) => {
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
    const productId = props.question?.product?.id;

    if (!productId) {
      notificationAdapter.add("Не удалось сгенерировать ответ: товар не указан", "error");
      return;
    }

    generateTransition(() => {
      const payload = {
        question: props.question.question,
        product_id: productId,
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

      <AnswerSuggestionModal
        isOpen={isModalOpen}
        subject={props.question.question}
        subjectLabel="Вопрос"
        fieldTitle="Ответ на вопрос"
        suggestion={suggestion || ""}
        currentValue={answer}
        onClose={handleCloseModal}
        onApply={handleApplyAnswer}
      />

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

        {props.question.create_user_id && (
          <Link href={`/users/info/${props.question.create_user_id}`}>
            <Button variant="link" variantColor="blue">
              Информация о пользователе
            </Button>
          </Link>
        )}

        {props.question?.product?.id && (
          <Link href={`/product/info/${props.question.product.id}`}>
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
        <Button
          type="button"
          variant="solid"
          variantColor="blue"
          size="sm"
          onClick={handleGenerate}
          disabled={submitLoading || generateLoading || !props.question?.product?.id}
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
            {submitLoading ? "Сохранение..." : "Сохранить"}
          </Button>
          <Button
            type="button"
            variantColor="error"
            variant="outline"
            onClick={() => setShowDeleteModal(true)}
            disabled={deleteLoading || generateLoading}
          >
            Удалить вопрос
          </Button>
        </div>
      </form>
    </>
  );
};
