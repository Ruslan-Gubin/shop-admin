"use server";
import Link from "next/link";
import { Button } from "@/shared/ui/button-main/Button";
import { ErrorAlert } from "@/shared/ui/error-alert/ErrorAlert";
import { UpdateToken } from "@/views/UpdateToken/UpdateToken";
import { OrderInfo } from "../../components/OrderInfo/OrderInfo";
import { fetchOrderEditPage } from "./action";

export default async function OrderEditPage(req: { params: Promise<{ id: string }> }) {
  const { id } = await req.params;
  const [productsData, orderData] = await fetchOrderEditPage(id);

  console.log(productsData);
  const products = productsData.data || [];
  const order = orderData.data;
  const title = order ? `Заказ # ${order.order_number}` : "Заказ";
  console.log(order);

  const example = `
Список товаров (таблица товаров с именем с переходом на /product/info/id, штрих-код, количество)


Отправления (пока не реализованно, могут быть 2 типов, 1 это отправление со склада на склад в случае если есть несколько складов и остатов не хватает на котором был заказ, 2 тип это отправление курьером )
Распределено товаров: 5/5


Список перемещений (если есть, пока моковые)
Отправление #43653  Перемещение из Рязанский склад в Южно-Московский склад (это на случай если на ближайшем складе не достаточно остатков товара, может быть несколько таких перемещений) время прибытия.
Отправление #43642 (отправнение курьером клиенту) из имя ближайшего слада(пока не реализованно) в  адрес куда указал клиент (oreder.address)
тут надо все варианты перебрать, к примеру если нет перемещений но остатков достаточно для отправления и это доставка курьером - тогда показать кнопку создать перемещение курьером (по клику переходим на экран подготовки товар к отправке)
и в целом  вариантов много, если не достаочно остатков тогда создать перемещение с ближайшего склада (отправление происходит с ближайшего склада до указанного адресса доставки курьером, я могу отсортировать адреса складов по близости от указанного адреса)

Само отправление имеет 
откуда: имя склада
куда: имя склада (если это перемещение со склада на склад иначе адрес доставки курьером)
номер заказа: по которому переходим в сам заказ
информация о покупателе кнопка с переходом на /users/info/id
Товары в отправлении: 2шт
Ценность отправления: 5000р (общая сумма всех товаров)
Статус: Подготовка отправления, В пути, Доставлено
Список товаров (таблица товаров с именем с переходом на /product/info/id, штрих-код, количество)
карта с отметкой склада или значок клиента куда доставляется
  `;

  return (
    <section className="page-wrapper">
      <h2>{title}</h2>
      {orderData?.tokens && <UpdateToken tokens={orderData.tokens} />}
      {orderData.status === "error" && orderData.message && (
        <ErrorAlert message={orderData.message} />
      )}
      {order && <OrderInfo order={order} />}
      <Link href="/orders">
        <Button variant="outline" size="sm">
          Назад к списку
        </Button>
      </Link>
    </section>
  );
}
