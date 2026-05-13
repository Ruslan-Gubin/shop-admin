# Модуль: Цены (Price Types, Product Prices, Price Auto-Fill)

## Контекст

**Цель:** Система управления ценами товаров — справочник типов цен, цены товаров, автозаполнение по закупочной цене.
**Бизнес-модель:** E-commerce с доставкой, розница/маркетплейс.

---

## Структура данных

### PriceType (Справочник типов цен)

```typescript
interface PriceTypeModel {
  id: number;
  name: string;              // "Розница", "Мелкий опт", "Крупный опт"
  description: string;       // Описание типа
  isPublic: boolean;         // Видна покупателям в карточке товара
  minQuantity: number;       // Минимальное количество для применения
  created_user_id: number;
  created_at: string;         // ISO Date
  updated_at: string | null;
}
```

**Валидация (Zod):**
- `name`: строка 2-50 символов
- `description`: строка 2-255 символов (опционально)

**Примеры:**

```json
{ "id": 1, "name": "Розница", "description": "Основная цена", "isPublic": true, "minQuantity": 1 }
{ "id": 2, "name": "Мелкий опт", "description": "Опт от 10 шт", "isPublic": true, "minQuantity": 10 }
{ "id": 3, "name": "Крупный опт", "description": "Опт от 100 шт", "isPublic": true, "minQuantity": 100 }
{ "id": 4, "name": "Закупочная", "description": "Себестоимость", "isPublic": false, "minQuantity": 0 }
```

---

### PriceRange (Диапазоны автозаполнения)

```typescript
interface RangeModel {
  id: number;
  price_from: number;  // Начало диапазона (включительно)
  price_to: number;    // Конец диапазона
  created_at: string;
  updated_at: string;
}
```

**Примеры:**

```json
{ "id": 1, "price_from": 0, "price_to": 99 }
{ "id": 2, "price_from": 100, "price_to": 499 }
{ "id": 3, "price_from": 500, "price_to": 999 }
{ "id": 4, "price_from": 1000, "price_to": 9999 }
```

**Валидация (Zod):**
- `price_from`: положительное число (>= 0)
- `price_to`: положительное число (> 0)
- `price_to >= price_from`

---

### PriceFill (Проценты наценки)

```typescript
interface PriceFillModel {
  id: number;
  price_range_id: number;  // FK → PriceRange
  price_type_id: number;   // FK → PriceType
  percent: number;          // Процент наценки
  created_at: string;
  updated_at: string;
}
```

**Примеры:**

```json
{ "id": 1, "price_range_id": 1, "price_type_id": 1, "percent": 100 }
{ "id": 2, "price_range_id": 1, "price_type_id": 2, "percent": 80 }
{ "id": 3, "price_range_id": 1, "price_type_id": 3, "percent": 70 }
```

---

### ProductPrice (Цена товара по типу)

```typescript
interface ProductPriceModel {
  id: number;
  product_id: number;       // FK → Product
  price_type_id: number;     // FK → PriceType
  price: number;             // Значение цены
  created_at: string;
  updated_at: string | null;
}
```

---

## API эндпоинты

### Price Types (справочник)

| Метод  | URL                      | Параметры                        | Описание                    |
| ------ | ------------------------ | -------------------------------- | --------------------------- |
| GET    | `/price-type/types`       | `name`, `limit`, `page`          | Список с фильтрацией         |
| GET    | `/price-type/{id}`       | —                                | Один тип по ID              |
| POST   | `/price-type/create`      | `{ name, description }`          | Создать                     |
| PATCH  | `/price-type/{id}`        | `{ name?, description? }`       | Обновить                    |
| DELETE | `/price-type/{id}`        | —                                | Удалить                     |

### Price Ranges (диапазоны)

| Метод  | URL                         | Параметры                    | Описание        |
| ------ | --------------------------- | ---------------------------- | --------------- |
| GET    | `/price-ranges`             | `search`                     | Список диапазонов |
| GET    | `/price-ranges/{id}`        | —                            | Один диапазон   |
| POST   | `/price-ranges/create`      | `{ price_from, price_to }`   | Создать         |
| PATCH  | `/price-ranges/{id}`        | `{ price_from?, price_to? }` | Обновить        |
| DELETE | `/price-ranges/{id}`        | —                            | Удалить         |

### Price Fill (проценты наценки)

| Метод  | URL                      | Параметры                              | Описание            |
| ------ | ------------------------ | -------------------------------------- | ------------------- |
| GET    | `/price-fill`            | —                                      | Все проценты        |
| POST   | `/price-fill/create`     | `{ price_range_id, price_type_id, percent }` | Создать  |
| PATCH  | `/price-fill/{id}`       | `{ percent }`                          | Обновить процент   |
| DELETE | `/price-fill/{id}`       | —                                      | Удалить             |

### Product Prices (цены товара)

| Метод  | URL                        | Параметры                            | Описание          |
| ------ | -------------------------- | ------------------------------------ | ----------------- |
| GET    | `/product-price/{product_id}` | —                               | Цены товара      |
| POST   | `/product-price/create`    | `{ product_id, price_type_id, price }` | Создать цену    |
| PATCH  | `/product-price/{id}`      | `{ price }`                          | Обновить цену    |
| DELETE | `/product-price/{id}`      | —                                    | Удалить цену     |

---

## UI / Компоненты

### `/price-types` — Справочник типов цен

**Страница:** `src/app/price-types/page.tsx`

**Компоненты:**
- `PriceTypesTableWrapper` — обёртка таблицы (desktop + mobile)
- `ModalPriceTypeForm` — модалка создания/редактирования

**Функциональность:**
- Таблица: ID, Название, Описание, От количества, Публичный
- Фильтрация по названию
- Пагинация (по 10 на страницу)
- Создание/редактирование в модалке
- Удаление с подтверждением

**Форма модалки:**
```
Название: [____________________________]    ← Input
Описание: [____________________________]    ← Input
Минимальное количество: [________________] ← Input (number)
[✓] Видна покупателям в карточке товара     ← Checkbox
```

---

### `/price-auto-fill` — Автозаполнение цен

**Страница:** `src/app/price-auto-fill/page.tsx`

**Компоненты:**
- `PriceAutoFillTableWrapper` — редактируемая таблица (desktop + mobile)
- `ModalRangeForm` — модалка диапазона

**Функциональность:**
- Редактируемая матрица: строки = диапазоны, колонки = типы цен
- Inline-редактирование процентов (onBlur → save)
- Создание/редактирование/удаление диапазонов
- Без пагинации (все на одной странице)

**Структура таблицы:**

```
| Диапазон     | Розница | Мелкий опт | Крупный опт | ... | Действия |
|--------------|---------|------------|-------------|-----|----------|
| 0 - 99       | [100%]  | [80%]      | [70%]       |     | ✏️ 🗑️    |
| 100 - 499    | [90%]   | [70%]      | [60%]       |     | ✏️ 🗑️    |
| 500 - 999    | [80%]   | [60%]      | [50%]       |     | ✏️ 🗑️    |
| 1000 - 9999  | [60%]   | [45%]      | [35%]       |     | ✏️ 🗑️    |
```

**Логика onBlur:**
- Пустое значение → DELETE
- Новое значение → POST
- Изменённое значение → PATCH

---

### Блок цен в форме товара

**Компонент:** `src/app/product/components/ProductForm/components/Prices/`

**Структура:**
- `ProductFormPrices.tsx` — блок цен

**Функциональность:**
- Поле "Закупочная цена" — ввод числового значения
- При изменении закупочной → запрос к бэку для получения значений из настроенных диапазонов
- Если диапазон найден → показать автозаполнение для каждого типа
- Кнопка "Заполнить все типы цен" — применяет рассчитанные значения
- Ручной ввод цен для каждого типа

**UI:**
```
Закупочная цена: [___________]  [Заполнить все типы цен]

Для этой закупочной цены не настроен диапазон. / Можно ввести вручную...

Розница:        [___________] 📋
Мелкий опт:     [___________] 📋
Крупный опт:    [___________] 📋
```

**Расчёт цены:**
```
Цена = Закупочная × (1 + percent / 100)
```

---

## Файловая структура

```
src/app/price-types/
├── page.tsx                                        # Server Component
├── action.ts                                       # Server Actions (CRUD)
├── schema.ts                                       # Zod схемы валидации
└── components/
    ├── PriceTypesTableWrapper/
    │   └── PriceTypesTableWrapper.tsx              # Client Component
    └── modal-price-type-form/
        └── ModalPriceTypeForm.tsx                 # Модалка формы

src/app/price-auto-fill/
├── page.tsx                                        # Server Component
├── action.ts                                       # Server Actions (CRUD)
├── schema.ts                                       # Zod схемы валидации
└── components/
    ├── PriceAutoFillTableWrapper/
    │   └── PriceAutoFillTableWrapper.tsx          # Редактируемая таблица
    └── modal-range-form/
        └── ModalRangeForm.tsx                      # Модалка диапазона

src/app/product/components/ProductForm/components/Prices/
└── ProductFormPrices.tsx                          # Блок цен в форме товара
```

---

## Логика сохранения цен товара

### Редактирование товара (`edit/[id]/action.ts`)

Функция `updateProductPriceValues`:

```
Для каждого типа цены:
  1. Если price есть и productPrice нет → POST (создать)
  2. Если price изменился → PATCH
  3. Если price пусто и productPrice есть → DELETE
```

### Автозаполнение (`getFillValuesAction`)

```
1. Найти диапазон: price_from <= purchase_price <= price_to
2. Если диапазон найден:
   - Получить все PriceFill для этого диапазона
   - Для каждого price_type_id рассчитать цену:
     price = purchase_price × (1 + percent / 100)
3. Вернуть { updateFillValues, isHasRange: true }
4. Если диапазон не найден:
   - Вернуть { updateFillValues: {}, isHasRange: false }
```

---

## Версионирование

| Версия | Дата       | Изменения                                         |
| ------ | ---------- | ------------------------------------------------- |
| 1.0    | 2026-05-11 | Начальная версия                                  |
| 1.1    | 2026-05-13 | Объединённая документация: Price Types + Price Auto-Fill + Product Prices |