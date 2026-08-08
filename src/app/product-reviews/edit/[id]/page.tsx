"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ErrorAlert } from "@/shared/ui/error-alert/ErrorAlert";
import { PageHeader } from "@/shared/ui/page-header/PageHeader";
import { UpdateToken } from "@/views/UpdateToken/UpdateToken";
import {
  type AnswerSuggestionPayload,
  answerProductReviewAction,
  deleteProductReviewAction,
  fetchProductReviewEdit,
  getAnswerSuggestionAction,
} from "../../action";
import { ProductReviewEditForm } from "../../components/ProductReviewEditForm/ProductReviewEditForm";

export default async function EditProductReviewPage(searchParams: {
  params: Promise<{ id: string }>;
}) {
  const params = await searchParams.params;
  const id = params.id;

  const reviewData = await fetchProductReviewEdit(id);
  const review = reviewData.data;

  const deleteAction = async () => {
    "use server";
    await deleteProductReviewAction(Number(id)).then((res) => {
      if (res.status === "success") {
        redirect("/product-reviews");
      }
    });
  };

  const submitAction = async (payload: { answer: string }) => {
    "use server";

    let notification: { status: "error" | "success"; message: string } | null = null;
    let errors: Record<string, string> | null = null;

    await answerProductReviewAction(payload, Number(id)).then((response) => {
      errors = response.errors;

      if (response.status === "success") {
        revalidatePath("/product-reviews");
        notification = {
          status: "success",
          message: "Ответ на отзыв успешно сохранен",
        };
      } else {
        notification = {
          status: "error",
          message: "Ошибка при сохранении ответа",
        };
      }
    });

    return { errors, notification };
  };

  const generateAnswerAction = async (payload: AnswerSuggestionPayload) => {
    "use server";

    let notification: { status: "error" | "success"; message: string } | null = null;
    let answer = "";

    await getAnswerSuggestionAction(payload).then((response) => {
      if (response.status === "success" && typeof response.data === "string") {
        answer = response.data;
      } else {
        notification = {
          status: "error",
          message: response.message || "Не удалось сгенерировать ответ",
        };
      }
    });

    return { notification, answer };
  };

  return (
    <section className="page-wrapper">
      {reviewData.tokens && <UpdateToken tokens={reviewData.tokens} />}
      <PageHeader title="Редактировать отзыв" fallbackHref="/product-reviews" />
      {!review && <ErrorAlert message={reviewData.message || "Отзыв не найден"} />}
      {review && (
        <ProductReviewEditForm
          generateAnswerAction={generateAnswerAction}
          review={review}
          submitAction={submitAction}
          deleteAction={deleteAction}
          initErrors={{ answer: "" }}
          initValues={{ answer: review.answer || "" }}
        />
      )}
    </section>
  );
}
