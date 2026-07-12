import Link from "next/link";
import { buildAddressString } from "@/shared/helpers/buildAddressString";
import { priceFormatter } from "@/shared/helpers/formatPrice";
import {
  orderMethodReceiptTranslations,
  orderPaymentMethodTranslations,
  orderStatusTranslations,
} from "@/shared/translate/order-translates";
import { Button } from "@/shared/ui/button-main/Button";
import { FormSection } from "@/widgets/form-section/FormSection";
import type { OrderModel } from "../../action";
import styles from "./OrderInfo.module.css";

type Props = {
  order: OrderModel;
};

export const OrderInfo = (props: Props) => {
  const formattedDate = props.order.created_at
    ? new Date(props.order.created_at).toLocaleString("ru-RU")
    : "---";

  const formatDateOnly = (date: string) => {
    const formattedDate = Intl.DateTimeFormat("ru", {
      year: "2-digit",
      month: "short",
      day: "2-digit",
    });
    return formattedDate.format(new Date(date));
  };

  const formatTimeOnly = (date: string) => {
    const dateNow = new Date(date);
    const hours = dateNow.getHours();
    return `${hours}: 00`;
  };

  return (
    <div className={styles.root}>
      <FormSection title="Общие данные">
        <div className={styles.mainContentContainer}>
          <p className={styles.fieldValue}>
            <span className={styles.fieldLabel}>Статус заказа: </span>
            <span
              className={
                props.order.status === "completed"
                  ? styles.statusCompleted
                  : props.order.status === "new" ||
                      props.order.status === "processing" ||
                      props.order.status === "ready" ||
                      props.order.status === "in_delivery"
                    ? styles.statusActive
                    : styles.statusCancelled
              }
            >
              {orderStatusTranslations[props.order.status] || props.order.status}
            </span>
          </p>
          {props.order.rejected_reason && (
            <p className={styles.fieldValue}>
              <span className={styles.fieldLabel}>Причина отмены: </span>
              {props.order.rejected_reason}
            </p>
          )}

          <p className={styles.fieldValue}>
            <span className={styles.fieldLabel}>Дата и время заказа: </span>
            {formattedDate}
          </p>

          {props.order.method_receipt === "pickup" && props.order.date_from && (
            <p className={styles.fieldValue}>
              <span className={styles.fieldLabel}>Клиент ожидает: </span>
              {formatDateOnly(props.order.date_from)} с {formatTimeOnly(props.order.date_from)}
              {props.order.date_to ? ` до ${formatTimeOnly(props.order.date_to)}` : ""}
            </p>
          )}

          <p className={styles.fieldValue}>
            <span className={styles.fieldLabel}>Способ получения: </span>
            {orderMethodReceiptTranslations[props.order.method_receipt]}
          </p>

          {props.order.method_receipt === "pickup" && props.order.address && (
            <p className={styles.fieldValue}>
              <span className={styles.fieldLabel}>Склад: </span>
              {props.order.address.name}
            </p>
          )}

          <p className={styles.fieldValue}>
            <span className={styles.fieldLabel}>Способ оплаты: </span>
            {orderPaymentMethodTranslations[props.order.payment_method]}
          </p>

          {props.order.discount_percent > 0 && (
            <>
              <p className={styles.fieldValue}>
                <span className={styles.fieldLabel}>Скидка: </span>
                {props.order.discount_name}
              </p>
              <p className={styles.fieldValue}>
                <span className={styles.fieldLabel}>Процент скидки: </span>
                {props.order.discount_percent}%
              </p>
              <p className={styles.fieldValue}>
                <span className={styles.fieldLabel}>Цена без скидки: </span>
                {priceFormatter.format(Number(props.order.subtotal))}
              </p>
              <p className={styles.fieldValue}>
                <span className={styles.fieldLabel}>Скидка всего: </span>
                {priceFormatter.format(Number(props.order.discount_total))}
              </p>
            </>
          )}

          <p className={styles.fieldValue}>
            <span className={styles.fieldLabel}>Сумма к оплате: </span>
            {priceFormatter.format(Number(props.order.total))}
          </p>
        </div>
      </FormSection>

      <FormSection title="Информация о покупателе">
        <div className={styles.mainContentContainer}>
          <p className={styles.fieldValue}>
            <span className={styles.fieldLabel}>Покупатель: </span>
            Физическое лицо
          </p>
          {props.order.recipient_name && (
            <p className={styles.fieldValue}>
              <span className={styles.fieldLabel}>Имя получателя: </span>
              {props.order.recipient_name}
            </p>
          )}
          {props.order.phone && (
            <p className={styles.fieldValue}>
              <span className={styles.fieldLabel}>Телефон получателя: </span>
              {props.order.phoneCode}
              {props.order.phone}
            </p>
          )}
          {props.order.comment && (
            <p className={styles.fieldValue}>
              <span className={styles.fieldLabel}>Комментарий: </span>
              {props.order.comment}
            </p>
          )}

          {props.order.create_user_id && (
            <Link href={`/users/info/${props.order.create_user_id}`}>
              <Button variant="link" variantColor="blue">
                Полная информация
              </Button>
            </Link>
          )}
        </div>
      </FormSection>

      {props.order.method_receipt === "courier" && (
        <FormSection title="Доставка">
          <div className={styles.mainContentContainer}>
            {props.order.date_from && (
              <p className={styles.fieldValue}>
                <span className={styles.fieldLabel}>Клиент ожидает: </span>
                {formatDateOnly(props.order.date_from)} с {formatTimeOnly(props.order.date_from)}
                {props.order.date_to ? ` до ${formatTimeOnly(props.order.date_to)}` : ""}
              </p>
            )}

            {props.order.status === "completed" && props.order.updated_at && (
              <p className={styles.fieldValue}>
                <span className={styles.fieldLabel}>Клиент получил заказ: </span>
                {new Date(props.order.updated_at).toLocaleString("ru-RU")}
              </p>
            )}

            {props.order.address && (
              <p className={styles.fieldValue}>
                <span className={styles.fieldLabel}>Адрес: </span>
                {buildAddressString(props.order.address)}
              </p>
            )}

            <p className={styles.fieldValue}>
              <span className={styles.fieldLabel}>Стоимость доставки: </span>
              100 ₽
            </p>
          </div>
        </FormSection>
      )}
    </div>
  );
};
