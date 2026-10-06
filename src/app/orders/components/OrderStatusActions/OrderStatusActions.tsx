"use client";
import Link from "next/link";
import type { WarehouseModel } from "@/app/warehouses/action";
import type { ResponseData } from "@/shared/types/response";
import { Button } from "@/shared/ui/button-main/Button";
import type { OrderMethodReceipt, OrderStatus } from "../../action";
import type { OrderProductModel } from "../../edit/[id]/action";
import { OrderCancel } from "../OrderCancel/OrderCancel";
import { OrderShortage } from "../OrderShortage/OrderShortage";
import { OrderSubmit } from "../OrderSubmit/OrderSubmit";
import styles from "./OrderStatusActions.module.css";

type Props = {
  isNeedTransfer: boolean;
  status: OrderStatus;
  order_id: number;
  method_receipt: OrderMethodReceipt;
  products: OrderProductModel[];
  warehouses: WarehouseModel[];
  isHasShortageStocksProblem: boolean;
  changeOrderStatusAction: (order_id: number) => Promise<ResponseData<null>>;
  cancelOrderAction: (order_id: number, rejected_reason: string) => Promise<ResponseData<null>>;
  updateShortageAction: (
    order_id: number,
    payload: { id: number; quantity: number; warehouse_id: number }[],
  ) => Promise<ResponseData<null>>;
  forcedShortageAction: (id: number) => Promise<ResponseData<null>>;
};

export const OrderStatusActions = (props: Props) => {
  const submitStatuses =
    props.status === "new" ||
    props.status === "processing" ||
    props.status === "ready" ||
    props.status === "in_delivery";

  const cancelStatuses =
    props.status !== "completed" &&
    props.status !== "cancelled_new" &&
    props.status !== "cancelled_ready" &&
    props.status !== "cancelled_assembly" &&
    props.status !== "cancelled_delivery" &&
    props.status !== "cancelled_customer";

  return (
    <div className={styles.actionsRow}>
      {cancelStatuses && (
        <OrderCancel order_id={props.order_id} cancelOrderAction={props.cancelOrderAction} />
      )}

      {(props.status === "new" || props.status === "processing") && props.products.length > 0 && (
        <OrderShortage
          isHasShortageStocksProblem={props.isHasShortageStocksProblem}
          warehouses={props.warehouses}
          order_id={props.order_id}
          products={props.products}
          updateShortageAction={props.updateShortageAction}
          forcedShortageAction={props.forcedShortageAction}
        />
      )}

      {!props.isNeedTransfer &&
        submitStatuses &&
        !props.isHasShortageStocksProblem &&
        props.products.length > 0 && (
          <OrderSubmit
            order_id={props.order_id}
            status={props.status}
            method_receipt={props.method_receipt}
            changeOrderStatusAction={props.changeOrderStatusAction}
          />
        )}

      {props.status === "new" && props.isNeedTransfer && !props.isHasShortageStocksProblem && (
        <Link href={`/transfer/stock-to-stock/${props.order_id}`}>
          <Button variant="solid" variantColor="green" size="md">
            Создать перемещение
          </Button>
        </Link>
      )}
    </div>
  );
};
