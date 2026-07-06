"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ErrorAlert } from "@/shared/ui/error-alert/ErrorAlert";
import { UpdateToken } from "@/views/UpdateToken/UpdateToken";
import {
  answerProductReviewAction,
  deleteProductReviewAction,
  fetchProductReview,
} from "../../action";
import { ProductReviewEditForm } from "../../components/ProductReviewEditForm/ProductReviewEditForm";

export default async function EditProductReviewPage(searchParams: {
  params: Promise<{ id: string }>;
}) {
  const params = await searchParams.params;
  const id = params.id;

  const reviewData = await fetchProductReview(id);
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

  return (
    <section className="page-wrapper">
      {reviewData.tokens && <UpdateToken tokens={reviewData.tokens} />}
      {!review && <ErrorAlert message={reviewData.message || "Отзыв не найден"} />}
      {review && (
        <ProductReviewEditForm
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
