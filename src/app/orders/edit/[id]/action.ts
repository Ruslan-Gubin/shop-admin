"use server";
import type { ProductModel } from "@/app/product/action";
import { fetchService } from "@/shared/fetch-api";
import type { OrderModel } from "../../action";

/**
 * Снимок товара на момент создания заказа.
 *
 * Хранит фиксированную копию данных о товаре (цена, количество, характеристики),
 * чтобы изменения в каталоге в будущем не влияли на уже оформленный заказ.
 *
 * @property {number} id — ID записи в заказе (порядковый номер позиции)
 * @property {number} order_id — ID заказа, к которому привязан товар
 * @property {number} product_id — ID товара в каталоге (для ссылки на /product/info/{id})
 * @property {string} name — Название товара на момент заказа
 * @property {string} code — Штрих-код товара
 * @property {number} price — Цена за единицу на момент заказа
 * @property {number} quantity — Количество единиц в заказе
 * @property {string} description — Описание товара
 * @property {string} country — Страна-производитель
 * @property {string} equipment — Комплектация / что входит в состав
 * @property {string} product_type — Вид товара
 * @property {number} height — Высота (для расчёта габаритов доставки)
 * @property {number} width — Ширина
 * @property {number} length — Длина
 * @property {number} weight — Вес
 * @property {string} created_at — Дата создания записи в заказе
 * @property {string} updated_at — Дата последнего изменения
 * @property {ReservedStock[]} reservations — Список резервов товара по складам.
 *   Позволяет понять, на каких складах и сколько единиц зарезервировано под этот заказ,
 *   и вычислить каких остатков не хватает для отгрузки (нужны перемещения между складами).
 */

/**
 * Список резервирований на момент заказа.
 * Каждый элемент — сколько единиц (`quantity`) было зарезервировано
 * на конкретном остатке складской позиции (`stock_id`).
 *
 * Сопоставив `reservations` с текущими остатками, можно определить:
 * - достаточно ли товара на складе для сборки
 * - с какого склада нужно сделать перемещение (если не хватает)
 */

export type OrderProductModel = {
  id: number;
  order_id: number;
  product_id: number;
  name: string;
  code: string;
  price: number;
  quantity: number;
  description: string;
  country: string;
  equipment: string;
  product_type: string;
  height: number;
  width: number;
  length: number;
  weight: number;
  created_at: string;
  updated_at: string;
  reservations: {
    quantity: number;
    stock_id: number;
  }[];
};

export const fetchOrderEditPage = async (id: string) => {
  return await fetchService.fetchChain<[ProductModel[], OrderModel]>([
    {
      url: `order-product/order/${id}`,
      tags: [`OrderProduct_${id}`],
    },
    {
      url: `orders/${id}`,
      tags: [`Orders_${id}`],
      revalidate: 30,
    },
  ]);
};
