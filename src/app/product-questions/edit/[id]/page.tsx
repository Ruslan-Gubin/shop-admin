// "use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ErrorAlert } from "@/shared/ui/error-alert/ErrorAlert";
import { UpdateToken } from "@/views/UpdateToken/UpdateToken";
import {
  deleteProductQuestionAction,
  fetchProductQuestion,
  updateProductQuestionAction,
} from "../../action";
import { ProductQuestionEditForm } from "../../components/ProductQuestionEditForm/ProductQuestionEditForm";

export default async function EditProductQuestionPage(searchParams: {
  params: Promise<{ id: string }>;
}) {
  const params = await searchParams.params;
  const id = params.id;

  const questionData = await fetchProductQuestion(id);
  const question = questionData.data;
  console.log(question);

  const deleteAction = async () => {
    "use server";
    await deleteProductQuestionAction(Number(id)).then((res) => {
      if (res.status === "success") {
        redirect("/product-questions");
      }
    });
  };

  const submitAction = async (payload: { answer: string }) => {
    "use server";

    let notification: { status: "error" | "success"; message: string } | null = null;
    let errors: Record<string, string> | null = null;

    await updateProductQuestionAction(payload, Number(id)).then((response) => {
      errors = response.errors;

      if (response.status === "success") {
        revalidatePath("/product-questions");
        notification = {
          status: "success",
          message: "Ответ успешно сохранен",
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
      {questionData.tokens && <UpdateToken tokens={questionData.tokens} />}
      {!question && <ErrorAlert message={questionData.message || "Вопрос не найден"} />}
      {question && (
        <ProductQuestionEditForm
          question={question}
          submitAction={submitAction}
          deleteAction={deleteAction}
          initErrors={{ answer: "" }}
          initValues={{ answer: question.answer || "" }}
        />
      )}
    </section>
  );
}
