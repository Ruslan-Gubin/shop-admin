# Модуль: Payment Integration (Интеграция платежей)

## Контекст

**Цель:** Приём платежей по банковским картам через ПСБ (Промсвязьбанк) с генерацией платёжной ссылки и QR-кода для клиента.

**Бизнес-модель:** E-commerce с доставкой и самовывозом. Клиент выбирает «Оплата картой» при оформлении заказа.

**Принцип:** Гибридный подход — callback от банка (webhook) + lazy check при открытии заказа.

---

## Поток платежа

```
Заказ → payment_method: "card"
                ↓
  Бэкенд → POST /payments/create (ПСБ)
                ↓
         payment_id + payment_url
                ↓
  Статус: payment_status: "pending"
                ↓
  ┌───────────────┴───────────────┐
  │                               │
  ↓                               ↓
Callback от банка ← →         Lazy check (админ открыл заказ)
  (webhook на роут)               │
  │                               ↓
  ↓                    Запрос к банку: GET статус
  Обновить статус                  │
  на "paid"                 ┌─────┴─────┐
                            ↓           ↓
                         "paid"    "failed"/"pending"
                            ↓           ↓
                      Обновить     Оставить как есть
                      на "paid"
```

---

## Статусы платежа

### В БД заказа (`payment_status`)

| Статус | Описание | Действие при получении от банка |
|--------|----------|----------------------------------|
| `pending` | Создан, ожидает оплаты | Ничего, ждём |
| `paid` | Оплачено ✅ | Заказ можно выдавать. Дальнейшие проверки не производятся |
| `failed` | Ошибка/отказ/истёк | Показываем в админке. Ссылка работает — можно ретрай |
| `refunded` | Возврат | Деньги вернулись клиенту |
| `partial_refund` | Частичный возврат | Часть суммы возвращена |

### Возможные ответы от банка

| Статус банка | Твой `payment_status` | Действие |
|---|---|---|
| `success` / `paid` / `captured` | → `paid` | Обновить, больше не проверять |
| `pending` / `hold` | → `pending` | Оставить |
| `failed` / `declined` | → `failed` | Сохранить (ссылка жива) |
| `cancelled` | → `failed` | Сохранить (ссылка жива) |
| `expired` | → `failed` | Сохранить. Нужна новая ссылка |
| `refunded` | → `refunded` | Деньги вернули |
| `partial_refunded` | → `partial_refund` | Частичный возврат |

### Правило перехода между статусами

```
pending ──→ paid ──→ refunded
   │                 ↓
   └──→ failed  partial_refund (опционально)
```

- `paid` → `pending` / `failed` — **невозможно**. Если банк подтвердил оплату, статус не откатывается
- `paid` может перейти только в `refunded` (по действию админа)
- `failed` → `paid` — **возможно** (если ошибка была временной, а клиент повторил позже)

---

## Поля заказа для платежей

```typescript
interface OrderModel {
  // ... существующие поля

  payment_method: "card" | "cash";        // Выбор клиента
  payment_status: "pending" | "paid" | "failed" | "expired" | "refunded" | "partial_refund";
  payment_id: string | null;              // ID транзакции в ПСБ
  payment_url: string | null;             // Ссылка на оплату
}
```

---

## Логика при открытии заказа (lazy check)

```
function checkPaymentStatus(order):
  если order.payment_status === "paid":
    return  // больше не беспокоим банк

  bankStatus := GET https://api.psb.ru/payments/{payment_id}/status

  если bankStatus === "success" | "paid" | "captured":
    order.payment_status := "paid"
    сохранить в БД

  если bankStatus === "failed" | "declined" | "cancelled":
    order.payment_status := "failed"
    сохранить в БД
    // ссылка жива, клиент может повторить

  если bankStatus === "expired":
    order.payment_status := "expired"
    сохранить в БД
    // нужна новая платёжная ссылка

  иначе:
    order.payment_status := "pending"
    // оставить как есть
```

---

## Callback от банка (webhook)

### Эндпоинт

```
POST /api/payments/callback
```

Банк отправляет POST с параметрами:
```json
{
  "orderId": "payment_id",
  "status": "success",
  "amount": 150000,
  "currency": "RUB"
}
```

### Обработка

```
POST /api/payments/callback:
  1. Валидация подписи (проверка, что запрос от банка)
  2. Поиск заказа по payment_id
  3. Обновление payment_status согласно статусу от банка
  4. 200 OK
```

---

## Создание платежа

### При оформлении заказа

```
Если payment_method === "card":
  POST https://api.psb.ru/payments/create
  Body: {
    amount: order.total * 100,   // сумма в копейках
    currency: "RUB",
    orderId: generatePaymentId(),  // свой уникальный ID
    returnUrl: "https://admin.site/orders/edit/{orderId}",
    callbackUrl: "https://admin.site/api/payments/callback",
    description: "Заказ № {order.order_number}"
  }

  Response: {
    paymentId: "psb-uuid",
    paymentUrl: "https://pay.psb.ru/..."
  }

  Сохранить:
    order.payment_id = response.paymentId
    order.payment_url = response.paymentUrl
    order.payment_status = "pending"
```

### Повторное создание (при expired)

```
Если payment_status === "expired":
  Создаётся новый платёж как при оформлении
  Обновляются payment_id и payment_url
  Статус сбрасывается на "pending"
```

---

## UI / Компоненты

### Страница заказа `/orders/edit/{id}`

**Блок оплаты** (показывать если `payment_method === "card"`):

```
┌─────────────────────────────────────┐
│  💳 Оплата картой                   │
│                                     │
│  Статус: Оплачен ✅ / Ожидает ⏳    │
│         / Ошибка ❌                  │
│                                     │
│  [ 💳 Оплатить ] ← ссылка на        │
│    (payment_url)   платёжную страницу│
│                                     │
│  [ 🖨 QR-код ] ← отобразить QR       │
│    (из payment_url)                  │
│                                     │
│  [ 🔄 Проверить статус ]            │
│  [ ↩ Вернуть средства ] (только     │
│    если paid)                        │
└─────────────────────────────────────┘
```

**Детали в админке:**

| Поле | Отображение |
|------|-------------|
| `payment_id` | Скрыто, но доступно для техподдержки |
| `payment_url` | Кликабельная ссылка «Оплатить» |
| `payment_status` | Цветной статус (зелёный/оранжевый/красный) |

### Кнопка проверки статуса

- Показывается если `payment_status !== "paid"`
- Дёргает action → проверка в банке → обновление в БД
- После успеха — обновляет UI без перезагрузки страницы

---

## Возврат средств (refund)

### UI

Кнопка «Вернуть средства» на странице заказа.
Показывается только если `payment_status === "paid"`.

### API запрос

```
POST https://api.psb.ru/payments/{payment_id}/refund
Body: { amount: order.total * 100 }
```

### Обработка

```
После успешного ответа от банка:
  order.payment_status = "refunded"
  Отправить уведомление клиенту
```

---

## Важные замечания

### Сумма платежа
Все суммы передаются в банк в **копейках** (Integer):
`1500.00 ₽` → `amount: 150000`

### Повторное использование ссылки
- При `failed`/`declined` — ссылка жива, новый платёж **не нужен**
- При `expired` — создаётся новая платёжная сессия

### Безопасность
- Callback от банка должен проверять подпись (secret key)
- Lazy check не требует подписи — это запрос твоего сервера к банку

### Когда отдавать заказ клиенту
`payment_status === "paid"` → 100% гарантия, деньги списаны → можно выдавать.
Чарджбэки (оспоривание платежа через 30-90 дней) — отдельный процесс, не влияет на выдачу заказа.

---

## Файловая структура

```
src/app/orders/
├── edit/[id]/
│   ├── page.tsx              # Страница заказа (добавить блок оплаты)
│   └── action.ts             # checkPaymentStatus / createPaymentAction
│
src/app/api/payments/
└── callback/
    └── route.ts              # Webhook от банка

src/shared/
├── services/
│   └── payment.service.ts     # API клиент для ПСБ
└── types/
    └── payment.ts             # Типы платежей
```

---

## Версионирование

| Версия | Дата | Изменения |
|--------|------|-----------|
| 1.0 | 2026-07-14 | Начальная версия |
