# Модуль "Заказы"

## Общее описание

Модуль управления заказами: список заказов (с пагинацией и поиском) и страница редактирования заказа с информацией о доставке, товарах и статусе.

---

## Структура

| Роут                      | Описание                                                |
| ------------------------- | ------------------------------------------------------- |
| `/orders`                 | Список заказов (таблица с пагинацией, поиск по номеру)  |
| `/orders/edit/[id]`       | Редактирование заказа (просмотр деталей, смена статуса) |
| `/orders/transfer/create` | Создание перемещения (план)                             |

---

## Модели данных

### OrderStatus

Файл: `src/app/orders/action.ts:7`

```typescript
type OrderStatus =
  | "new" // Новый заказ
  | "cancelled_new" // Отменён на этапе нового (админ)
  | "processing" // В сборке
  | "cancelled_assembly" // Отменён в процессе сборки
  | "ready" // Готов к самовывозу
  | "in_delivery" // Передан в доставку
  | "cancelled_delivery" // Отменён при доставке
  | "completed" // Получен клиентом
  | "cancelled_customer"; // Отменён клиентом
```

### OrderPaymentMethod

```typescript
type OrderPaymentMethod = "cash" | "card";
```

### OrderMethodReceipt

```typescript
type OrderMethodReceipt = "courier" | "pickup";
```

### OrderModel

Файл: `src/app/orders/action.ts:21`

```typescript
type OrderModel = {
  id: number;
  order_number: string; // Номер заказа
  status: OrderStatus; // Статус
  payment_method: OrderPaymentMethod;
  method_receipt: OrderMethodReceipt; // courier | pickup

  // Покупатель
  create_user_id: number;
  phone: string;
  phoneCode: string;
  recipient_name: string;
  comment: string;

  // Даты
  date_from: string | null; // Ожидаемая дата получения
  date_to: string | null;
  created_at: string;
  updated_at: string | null;

  // Финансы
  subtotal: number;
  discount_quantity: number;
  discount_name: string;
  discount_percent: number;
  discount_total: number;
  total: number | string;

  // Отмена
  rejected_reason: string;

  // Адрес (склад для pickup / адрес для courier)
  address: AddressItem | null;

  // Главный склад (план — добавить)
  // warehouse_id: number;
};
```

### OrderProductModel

Файл: `src/app/orders/edit/[id]/action.ts:29`

Снимок товара на момент создания заказа. Хранит фиксированную копию данных, чтобы изменения в каталоге не влияли на уже оформленный заказ.

```typescript
type OrderProductModel = {
  id: number;
  order_id: number;
  product_id: number; // ID товара в каталоге (для ссылки)
  name: string;
  code: string; // Штрих-код
  price: number; // Цена за единицу на момент заказа
  quantity: number; // Количество в заказе

  // Характеристики товара (snapshot)
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

  // Резервы товара по складам
  reservations: {
    quantity: number; // Сколько зарезервировано
    stock_id: number; // ID остатка (product-stock)
    // warehouse_id: number; // ← план: ID склада (добавить)
  }[];
};
```

---

## API Endpoints

### GET `/orders`

Параметры: `limit`, `page`, `order_number`

Ответ:

```typescript
{
  paginationPage: string;
  orders: OrderModel[];
  totalCount: number;
}
```

### GET `/orders/{id}`

Ответ: [`ResponseData<OrderModel>`]()

### GET `/order-product/order/{id}`

Ответ: [`ResponseData<OrderProductModel[]>`]()

Возвращает список товаров с резервами для конкретного заказа.

---

## Компонентная структура

### Список заказов (`/orders`)

```
src/app/orders/page.tsx (server component)
└── OrdersTableWrapper (client component)
    ├── TableControls — поиск по номеру заказа
    ├── MainTable / MainMobileTable — десктопная / мобильная версия
    └── Pagination

Колонки таблицы:
| Номер заказа | Статус | Телефон | Сумма | Оплата | Способ получения | Дата создания |
```

### Редактирование заказа (`/orders/edit/[id]`)

```
src/app/orders/edit/[id]/page.tsx (server component)
├── OrderInfo — общие данные, покупатель, доставка
├── OrderProductsTable — список товаров с резервами
└── (план) OrderStatusActions — кнопки смены статуса
```

### OrderInfo

Файл: `src/app/orders/components/OrderInfo/OrderInfo.tsx`

Секции:

1. **Общие данные** — статус, дата, способ получения, способ оплаты, скидка, сумма
2. **Информация о покупателе** — имя, телефон, комментарий, ссылка на пользователя
3. **Доставка** (только для `courier`) — адрес, дата получения, стоимость доставки

### OrderProductsTable

Файл: `src/app/orders/components/OrderProductsTable/OrderProductsTable.tsx`

Колонки: Название (ссылка на товар), Штрих-код, Количество.

План: добавить колонку «Наличие» с индикацией необходимости перемещения.

---

## Статусы заказа

### Диаграмма

```
                  ┌───────────────┐
                  │ cancelled_new │
                  │ (админ)       │
                  └───────┬───────┘
                          │
┌─────┐     ┌──────────┐ │  ┌──────────────────┐
│ NEW │────▶│PROCESSING │─┼─▶│ cancelled_assembly│
└─────┘     └─────┬────┘ │  │ (админ/сборщик)   │
                  │       │  └──────────────────┘
                  ▼       │
           ┌──────────┐   │
           │   READY  │   │
           └────┬─────┘   │
                │         │
         ┌──────┴──────┐  │
         ▼             ▼  │
  ┌──────────┐  ┌───────────┐
  │completed │  │in_delivery│
  │(самовы-  │  │(курьер)   │
  │ воз)     │  └─────┬─────┘
  └──────────┘        │
                 ┌────┴────┐
                 ▼         ▼
          ┌──────────┐ ┌───────────────┐
          │completed │ │cancelled_     │
          │(достав-  │ │delivery       │
          │ лен)     │ │(служба достав-│
          └──────────┘ │ ки)           │
                       └───────────────┘
```

Также из любого статуса возможен переход в `cancelled_customer` (отмена клиентом).

### Таблица статусов

| Статус               | Кем устанавливается | Описание                                    |
| -------------------- | ------------------- | ------------------------------------------- |
| `new`                | Система             | Новый заказ, требует обработки              |
| `cancelled_new`      | Админ               | Отменён на этапе нового (`rejected_reason`) |
| `processing`         | Админ/Сборщик       | В процессе сборки                           |
| `cancelled_assembly` | Сборщик/Админ       | Отменён во время сборки (`rejected_reason`) |
| `ready`              | Сборщик/Админ       | Собран, готов к самовывозу                  |
| `in_delivery`        | Система/Админ       | Передан в доставку                          |
| `cancelled_delivery` | Служба доставки     | Отменён при доставке (`rejected_reason`)    |
| `completed`          | Система/Админ       | Получен клиентом                            |
| `cancelled_customer` | Клиент              | Отменён клиентом (`rejected_reason`)        |

---

## Переводы

Файл: `src/shared/translate/order-translates.ts`

| Ключ                 | Значение           |
| -------------------- | ------------------ |
| `new`                | Новый              |
| `cancelled_new`      | Отменён (новый)    |
| `processing`         | В обработке        |
| `cancelled_assembly` | Отменён (сборка)   |
| `ready`              | Готов              |
| `in_delivery`        | В доставке         |
| `cancelled_delivery` | Отменён (доставка) |
| `completed`          | Завершён           |
| `cancelled_customer` | Отменён клиентом   |
| `cash`               | Наличными          |
| `card`               | Банковской картой  |
| `pickup`             | Самовывоз          |
| `courier`            | Курьер             |

---

## Кэширование

Используется `fetchService` с тегами:

- `Orders_${page}_${limit}_${order_number}` — список заказов
- `Orders_${id}` — конкретный заказ
- `OrderProduct_${id}` — товары заказа

---

## Планы (ближайшие)

1. Добавить `warehouse_id` в `OrderModel` — главный склад выдачи/доставки
2. Добавить `warehouse_id` в `reservations` — склад каждого резерва
3. Реализовать `OrderStatusActions` — кнопки смены статуса
4. Создать страницу `/orders/transfer/create` — создание перемещений
5. Добавить колонку «Наличие» в `OrderProductsTable`
6. Подробнее: [`order-status-new-to-processing.md`](./order-status-new-to-processing.md)
