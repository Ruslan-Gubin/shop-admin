import { ErrorAlert } from "@/shared/ui/error-alert/ErrorAlert";
import { UpdateToken } from "@/views/UpdateToken/UpdateToken";
import { ActivePromotions } from "@/widgets/dashboard/active-promotions/ActivePromotions";
import { ActiveTransfers } from "@/widgets/dashboard/active-transfers/ActiveTransfers";
import { LowStockProducts } from "@/widgets/dashboard/low-stock-products/LowStockProducts";
import { NewOrders } from "@/widgets/dashboard/new-orders/NewOrders";
import { PendingQuestions } from "@/widgets/dashboard/pending-questions/PendingQuestions";
import { PendingReviews } from "@/widgets/dashboard/pending-reviews/PendingReviews";
import { SalesSchedule } from "@/widgets/dashboard/sales-schedule/SalesSchedule";
import { SalesStats } from "@/widgets/dashboard/sales-stats/SalesStats";
import { SummaryCards } from "@/widgets/dashboard/summary-cards/SummaryCards";
import { fetchDashboardData } from "./dashboard-action";
import styles from "./styles/Home.module.css";

export default async function HomePage(req: {
  searchParams: Promise<{ page: string; name?: string }>;
}) {
  const searchParams = await req.searchParams;
  const [usersData, ordersData, transfersData, productsData, newOrdersData, statsData] =
    await fetchDashboardData();

  const newOrders = newOrdersData.data?.orders || [];
  console.log(statsData);

  return (
    <section className="page-wrapper">
      {statsData?.tokens && <UpdateToken tokens={statsData.tokens} />}
      {usersData.status === "error" && usersData.message && (
        <ErrorAlert message={usersData.message} />
      )}
      {ordersData.status === "error" && ordersData.message && (
        <ErrorAlert message={ordersData.message} />
      )}
      {transfersData.status === "error" && transfersData.message && (
        <ErrorAlert message={transfersData.message} />
      )}
      {productsData.status === "error" && productsData.message && (
        <ErrorAlert message={productsData.message} />
      )}
      {newOrdersData.status === "error" && newOrdersData.message && (
        <ErrorAlert message={newOrdersData.message} />
      )}
      {statsData.status === "error" && statsData.message && (
        <ErrorAlert message={statsData.message} />
      )}

      <div className={styles.dashboard}>
        <SummaryCards
          users={usersData.data?.totalCount || 0}
          products={productsData.data?.totalCount || 0}
          orders={ordersData.data?.totalCount || 0}
          transfers={transfersData.data?.totalCount || 0}
        />

        {newOrders.length > 0 && <NewOrders orders={newOrders} />}

        {statsData.data && (
          <SalesStats
            total={statsData.data.total || 0}
            totalCart={statsData.data.totalCart || 0}
            averageCheck={statsData.data.averageCheck || 0}
            ordersCount={statsData.data.ordersCount || 0}
            discount={statsData.data.discount || 0}
            totalCash={statsData.data.totalCash || 0}
          />
        )}

        {/* Блок 4: Неотвеченные вопросы (данные будут позже) */}
        <PendingQuestions questions={[]} />

        {/* Блок 5: Неотвеченные отзывы (данные будут позже) */}
        <PendingReviews reviews={[]} />

        {/* Блок 6: Активные перемещения (данные будут позже) */}
        <ActiveTransfers transfers={[]} />

        {/* Блок 7: Активные акции (данные будут позже) */}
        <ActivePromotions promotions={[]} />

        {/* Блок 8: Товары с малым остатком (данные будут позже) */}
        <LowStockProducts products={[]} />

        {/* Блок 9: График продаж (заглушка) */}
        <SalesSchedule />
      </div>
    </section>
  );
}
