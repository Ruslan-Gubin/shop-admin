import Link from "next/link";
import type { OrderProductModel } from "@/app/orders/edit/[id]/action";
import type { ProductStockModel } from "@/app/warehouses/action";
import { getNeedTransferCount } from "@/shared/helpers/getNeedTransferCount";
import { Button } from "@/shared/ui/button-main/Button";
import { ErrorAlert } from "@/shared/ui/error-alert/ErrorAlert";
import { UpdateToken } from "@/views/UpdateToken/UpdateToken";
import { TransfersList } from "@/widgets/transfers-list/TransfersList";
import { createTransferOrderToOrderAction, fetchTransferStockToStock } from "./action";
import { TransferStockToStockForm } from "./components/form/TransferStockToStockForm";

export default async function TransferStockToStockPage(req: {
  params: Promise<{ order_id: string }>;
}) {
  const params = await req.params;
  const [transfersData, stocksData, productsData, orderData] = await fetchTransferStockToStock(
    params.order_id,
  );

  const transfers = transfersData.data || [];
  const products = productsData.data || [];
  const stocks = stocksData.data || [];
  const order = orderData.data;
  const baseWarehouseId = order?.warehouse?.id || 0;

  const getInitValues = (products: OrderProductModel[], stocks: ProductStockModel[]) => {
    const initValues: Record<string, string> = {};
    const reservationMap = new Map();

    for (let i = 0; i < products.length; i++) {
      for (let j = 0; j < products[i].reservations.length; j++) {
        if (!reservationMap.has(products[i].reservations[j].stock_id)) {
          reservationMap.set(
            products[i].reservations[j].stock_id,
            products[i].reservations[j].quantity,
          );
        }
      }

      for (let i = 0; i < stocks.length; i++) {
        const stock = stocks[i];

        if (reservationMap.has(stock.id)) {
          initValues[stock.id] = String(reservationMap.get(stock.id));
        } else {
          initValues[stock.id] = "0";
        }
      }
    }

    return initValues;
  };

  const initValues = productsData && stocksData ? getInitValues(products, stocks) : null;

  const getOrderProductList = (
    products: OrderProductModel[],
    stocks: ProductStockModel[],
    baseId: number,
  ) => {
    const orderProducts = [];

    for (let i = 0; i < products.length; i++) {
      const product = products[i];

      const filterStocks = stocks
        .filter((el) => el.product.id === product.product_id && el.warehouse.id !== baseId)
        .sort((a, b) => b.id - a.id);

      const baseReservation = product.reservations.find((el) => el.warehouse_id === baseId);

      const maxStocks: Record<string, number | undefined> = {};

      for (const stock of stocks) {
        if (stock.in_stock) {
          maxStocks[stock.id] = undefined;
        } else {
          const findReservation = product.reservations.find((r) => r.stock_id === stock.id);
          maxStocks[stock.id] = stock.quantity - stock.reserved + (findReservation?.quantity || 0);
        }
      }

      orderProducts.push({
        id: product.id,
        name: product.name,
        needInOrderCount: product.quantity,
        readyInBaseWarehouseCount:
          product.quantity - getNeedTransferCount(product.reservations, baseId),
        needReservationCount: getNeedTransferCount(product.reservations, baseId),
        stocks: filterStocks,
        baseReservation: baseReservation || null,
        maxStocks,
      });
    }

    return orderProducts;
  };

  const orderProductList =
    productsData && stocksData ? getOrderProductList(products, stocks, baseWarehouseId) : [];

  return (
    <section className="page-wrapper">
      <h2>
        {transfers.length > 0
          ? `Перемещения для заказа #${params.order_id}`
          : "Создать перемещение со склада на склад"}
      </h2>
      {orderData?.tokens && <UpdateToken tokens={orderData.tokens} />}
      {transfersData.status === "error" && transfersData.message && (
        <ErrorAlert message={transfersData.message} />
      )}
      {stocksData.status === "error" && stocksData.message && (
        <ErrorAlert message={stocksData.message} />
      )}
      {productsData.status === "error" && productsData.message && (
        <ErrorAlert message={productsData.message} />
      )}
      {orderData.status === "error" && orderData.message && (
        <ErrorAlert message={orderData.message} />
      )}

      {params.order_id && (
        <Link href={`/orders/edit/${params.order_id}`}>
          <Button variant="link" variantColor="blue">
            Информация заказа
          </Button>
        </Link>
      )}
      {transfers.length > 0 ? (
        <TransfersList transfers={transfers} products={products} baseId={baseWarehouseId} />
      ) : (
        initValues && (
          <TransferStockToStockForm
            order_id={params.order_id}
            initValues={initValues}
            orderProductList={orderProductList}
            baseId={baseWarehouseId}
            createTransferOrderToOrderAction={createTransferOrderToOrderAction}
          />
        )
      )}
    </section>
  );
}
