import { ErrorAlert } from "@/shared/ui/error-alert/ErrorAlert";
import { UpdateToken } from "@/views/UpdateToken/UpdateToken";
import { ActivePromotions } from "@/widgets/dashboard/active-promotions/ActivePromotions";
import { ActiveTransfers } from "@/widgets/dashboard/active-transfers/ActiveTransfers";
import { LowStockProducts } from "@/widgets/dashboard/low-stock-products/LowStockProducts";
import { NewOrders } from "@/widgets/dashboard/new-orders/NewOrders";
import { PendingQuestions } from "@/widgets/dashboard/pending-questions/PendingQuestions";
import { SalesSchedule } from "@/widgets/dashboard/sales-schedule/SalesSchedule";
import { SalesStats } from "@/widgets/dashboard/sales-stats/SalesStats";
import { SummaryCards } from "@/widgets/dashboard/summary-cards/SummaryCards";
import { fetchDashboardData } from "./dashboard-action";
import styles from "./styles/Home.module.css";

export default async function HomePage() {
  const [
    usersData,
    ordersData,
    transfersData,
    productsData,
    newOrdersData,
    questionsData,
    transfersProcessingData,
    productsLowData,
    promotionsData,
    salesScheduleData,
    statsData,
  ] = await fetchDashboardData();

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
      {questionsData.status === "error" && questionsData.message && (
        <ErrorAlert message={questionsData.message} />
      )}
      {productsLowData.status === "error" && productsLowData.message && (
        <ErrorAlert message={productsLowData.message} />
      )}
      {promotionsData.status === "error" && promotionsData.message && (
        <ErrorAlert message={promotionsData.message} />
      )}
      {salesScheduleData.status === "error" && salesScheduleData.message && (
        <ErrorAlert message={salesScheduleData.message} />
      )}

      <div className={styles.dashboard}>
        <SummaryCards
          users={usersData.data?.totalCount || 0}
          products={productsData.data?.totalCount || 0}
          orders={ordersData.data?.totalCount || 0}
          transfers={transfersData.data?.totalCount || 0}
        />

        {salesScheduleData.data && salesScheduleData.data.length > 0 && (
          <SalesSchedule salesSchedule={salesScheduleData.data} />
        )}

        {newOrdersData.data && newOrdersData.data?.orders?.length > 0 && (
          <NewOrders orders={newOrdersData.data?.orders || []} />
        )}

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

        {questionsData.data && questionsData.data?.questions?.length > 0 && (
          <PendingQuestions questions={questionsData.data.questions || []} />
        )}

        {transfersProcessingData.data && transfersProcessingData.data?.transfers?.length > 0 && (
          <ActiveTransfers transfers={transfersProcessingData.data?.transfers || []} />
        )}

        {productsLowData.data && productsLowData.data.length > 0 && (
          <LowStockProducts products={productsLowData.data || []} />
        )}

        {promotionsData.data && promotionsData.data.length > 0 && (
          <ActivePromotions promotions={promotionsData.data || []} />
        )}
      </div>
    </section>
  );
}
