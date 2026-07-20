"use server";
import { priceFormatter } from "@/shared/helpers/formatPrice";
import { ErrorAlert } from "@/shared/ui/error-alert/ErrorAlert";
import { Pagination } from "@/shared/ui/pagination/Pagination";
import { UpdateToken } from "@/views/UpdateToken/UpdateToken";
import { fetchUserInfoPage } from "./action";
import { UserInfoBlock } from "./components/UserInfoBlock/UserInfoBlock";
import { UserOrdersTable } from "./components/UserOrdersTable/UserOrdersTable";
import { UserQuestionsTable } from "./components/UserQuestionsTable/UserQuestionsTable";
import { UserReviewsTable } from "./components/UserReviewsTable/UserReviewsTable";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    order_page?: string;
    review_page?: string;
    question_page?: string;
  }>;
};

export default async function UserInfoPage(req: Props) {
  const { id } = await req.params;
  const searchParams = await req.searchParams;
  const limit = 5;
  const patch = `/users/info/${id}`;

  const orderPage = searchParams.order_page || "1";
  const reviewPage = searchParams.review_page || "1";
  const questionPage = searchParams.question_page || "1";

  const [userData, ordersData, reviewsData, questionsData] = await fetchUserInfoPage(
    id,
    orderPage,
    reviewPage,
    questionPage,
  );

  const user = userData.data;
  const orders = ordersData.data?.orders || [];
  const reviews = reviewsData.data?.reviews || [];
  const questions = questionsData.data?.questions || [];

  const ordersWithTotal = orders.map((el) => ({
    ...el,
    total: typeof el.total === "number" && el.total ? priceFormatter.format(el.total) : "---",
  }));
  return (
    <section className="page-wrapper">
      {questionsData?.tokens && <UpdateToken tokens={questionsData.tokens} />}

      <h2>Информация о пользователе</h2>

      {userData.status === "error" && userData.message && <ErrorAlert message={userData.message} />}
      {ordersData.status === "error" && ordersData.message && (
        <ErrorAlert message={ordersData.message} />
      )}
      {reviewsData.status === "error" && reviewsData.message && (
        <ErrorAlert message={reviewsData.message} />
      )}
      {questionsData.status === "error" && questionsData.message && (
        <ErrorAlert message={questionsData.message} />
      )}

      {user && <UserInfoBlock user={user} />}

      <div className="page-wrapper">
        {orders.length > 0 && (
          <section className="table-container">
            <h3>Заказы</h3>

            <UserOrdersTable orders={ordersWithTotal} />

            {ordersData?.data &&
              typeof ordersData?.data?.totalCount === "number" &&
              ordersData?.data?.totalCount > limit && (
                <Pagination
                  page={Number(ordersData?.data?.paginationPage || 1)}
                  limit={limit}
                  total={ordersData?.data?.totalCount || 0}
                  patch={patch}
                  searchParams={searchParams}
                  page_key="order_page"
                />
              )}
          </section>
        )}

        {reviews.length > 0 && (
          <section className="table-container">
            <h3>Отзывы</h3>

            <UserReviewsTable reviews={reviews} />

            {reviewsData?.data &&
              typeof reviewsData?.data?.totalCount === "number" &&
              reviewsData?.data?.totalCount > limit && (
                <Pagination
                  page={Number(reviewsData?.data?.paginationPage || 1)}
                  limit={limit}
                  total={reviewsData?.data?.totalCount || 0}
                  patch={patch}
                  searchParams={searchParams}
                  page_key="review_page"
                />
              )}
          </section>
        )}

        {questions.length > 0 && (
          <section className="table-container">
            <h3>Вопросы</h3>

            <UserQuestionsTable questions={questions} />

            {questionsData?.data &&
              typeof questionsData?.data?.totalCount === "number" &&
              questionsData?.data?.totalCount > limit && (
                <Pagination
                  page={Number(questionsData?.data?.paginationPage || 1)}
                  limit={limit}
                  total={questionsData?.data?.totalCount || 0}
                  patch={patch}
                  searchParams={searchParams}
                  page_key="question_page"
                />
              )}
          </section>
        )}
      </div>
    </section>
  );
}
