# Модуль: Склады и Остатки (Warehouses & Product Stocks)

## Контекст

**Цель:** Справочник складов для мультискладского учёта + остатки товаров по складам.
**Бизнес-модель:** E-commerce с доставкой, розница/маркетплейс, несколько складов.

---

## Структура данных

### Warehouse (Склад)

````typescript
interface WarehouseModel {
  id: number;
  name: string;              // Название склада
  address: string;           // Полный адрес
  area: string;              // Район
## Контекст

**Цель:** Справочник складов для мультискладского учёта + остатки товаров по складам.
**Бизнес-модель:** E-commerce с доставкой, розница/маркетплейс, несколько складов.

---

## Структура данных

### Warehouse (Склад)

```typescript
interface WarehouseModel {
  id: number;
  name: string;              // Название склада
  address: string;           // Полный адрес
  area: string;              // Район
  city: string;               // Город
  street: string;             // Улица
  house: string;              // Дом
  index: string;              // Почтовый индекс
  office: string;             // Офис/квартира
  create_user_id: number;     // ID создателя
  description: string;         // Описание
  is_active: boolean;          // Активен
  default_warehouse: boolean;  // Склад по умолчанию
  is_public: boolean;         // Публичный (видим клиентам)
  created_at: Date;
  updated_at: Date | null;
}
````

**Поля:**

| Поле                | Тип     | Описание                                        |
| ------------------- | ------- | ----------------------------------------------- |
| `id`                | number  | Уникальный идентификатор                        |
| `name`              | string  | Название ("Склад Москва", "Филиал Центральный") |
| `address`           | string  | Полный адрес (формируется из частей)            |
| `area`              | string  | Район                                           |
| `city`              | string  | Город                                           |
| `street`            | string  | Улица                                           |
| `house`             | string  | Дом                                             |
| `index`             | string  | Почтовый индекс                                 |
| `office`            | string  | Офис/квартира                                   |
| `create_user_id`    | number  | ID пользователя, создавшего склад               |
| `description`       | string  | Описание склада                                 |
| `is_active`         | boolean | Активен (можно использовать)                    |
| `default_warehouse` | boolean | Склад по умолчанию (для новых товаров)          |
| `is_public`         | boolean | Публичный (виден клиентам)                      |
| `created_at`        | Date    | Дата создания                                   |
| `updated_at`        | Date    | Дата обновления                                 |

**Логика полей:**

- `default_warehouse: true` — только один склад может быть по умолчанию
- `is_public: true` — склад отображается клиентам при выборе доставки
- `is_active: false` — склад暂时 не используется (soft disable)
  city: string; // Город
  street: string; // Улица
  house: string; // Дом
  index: string; // Почтовый индекс
  office: string; // Офис/квартира
  create_user_id: number; // ID создателя
  description: string; // Описание
  is_active: boolean; // Активен
  default_warehouse: boolean; // Склад по умолчанию
  is_public: boolean; // Публичный (видим клиентам)
  created_at: Date;
  updated_at: Date | null;
  }

````

**Поля:**

| Поле             | Тип      | Описание                                      |
| ---------------- | -------- | --------------------------------------------- |
| `id`             | number   | Уникальный идентификатор                      |
| `name`           | string   | Название ("Склад Москва", "Филиал Центральный") |
| `address`        | string   | Полный адрес (формируется из частей)           |
| `area`           | string   | Район                                         |
| `city`           | string   | Город                                         |
| `street`         | string   | Улица                                         |
| `house`          | string   | Дом                                           |
| `index`          | string   | Почтовый индекс                               |
| `office`         | string   | Офис/квартира                                 |
| `create_user_id` | number   | ID пользователя, создавшего склад             |
| `description`    | string   | Описание склада                               |
| `is_active`      | boolean  | Активен (можно использовать)                   |
| `default_warehouse` | boolean | Склад по умолчанию (для новых товаров)      |
| `is_public`      | boolean  | Публичный (виден клиентам)                    |
| `created_at`     | Date     | Дата создания                                 |
| `updated_at`     | Date     | Дата обновления                               |

**Логика полей:**

- `default_warehouse: true` — только один склад может быть по умолчанию
- `is_public: true` — склад отображается клиентам при выборе доставки
- `is_active: false` — склад暂时 не используется (soft disable)

---

### ProductStock (Остатки товара на складе)

```typescript
interface ProductStockModel {
  id: number;
  warehouse_id: number;   // FK → Warehouse
  product_id: number;     // FK → Product
  quantity: number;        // Общее количество
  reserved: number;        // В резерве (зарезервировано в заказах)
  available: number;       // Доступно (quantity - reserved)
  in_stock: boolean;       // В наличии (доступно > 0)
  accounting: boolean;     // Включить учёт количества
  created_at: Date;
  updated_at: Date | null;
}
````

**Поля:**

| Поле           | Тип     | Описание                                   |
| -------------- | ------- | ------------------------------------------ |
| `id`           | number  | Уникальный идентификатор                   |
| `warehouse_id` | number  | FK → Warehouse                             |
| `product_id`   | number  | FK → Product                               |
| `quantity`     | number  | Общее количество товара на складе          |
| `reserved`     | number  | Зарезервировано (в обработке заказов)      |
| `available`    | number  | Доступно для продажи (quantity - reserved) |
| `in_stock`     | boolean | В наличии (available > 0)                  |
| `accounting`   | boolean | Включить учёт количества для этого товара  |
| `created_at`   | Date    | Дата создания                              |
| `updated_at`   | Date    | Дата обновления                            |

**Логика полей:**

- `available = quantity - reserved`
- `in_stock = available > 0`
- `accounting: false` — товар не отслеживается по количеству (бесконечный остаток)

**Примеры:**

```json
// Товар в наличии
{
  "id": 1,
  "warehouse_id": 1,
  "product_id": 100,
  "quantity": 50,
  "reserved": 10,
  "available": 40,
  "in_stock": true,
  "accounting": true
}

// Товар в резерве (ожидает отгрузки)
{
  "id": 2,
  "warehouse_id": 1,
  "product_id": 101,
  "quantity": 20,
  "reserved": 20,
  "available": 0,
  "in_stock": false,
  "accounting": true
}

// Товар без учёта количества
{
  "id": 3,
  "warehouse_id": 1,
  "product_id": 102,
  "quantity": 0,
  "reserved": 0,
  "available": 0,
  "in_stock": true,
  "accounting": false
}
```

---

## API эндпоинты

### Warehouses (склады)

| Метод  | URL                  | Параметры                      | Описание         |
| ------ | -------------------- | ------------------------------ | ---------------- |
| GET    | `/warehouses`        | `name`, `limit`, `page`        | Список складов   |
| GET    | `/warehouses/{id}`   | —                              | Один склад по ID |
| POST   | `/warehouses/create` | `{ name, address, city, ... }` | Создать склад    |
| PATCH  | `/warehouses/{id}`   | `{ name?, is_active?, ... }`   | Обновить склад   |
| DELETE | `/warehouses/{id}`   | —                              | Удалить склад    |

### Product Stocks (остатки)

| Метод  | URL                              | Параметры                           | Описание             |
| ------ | -------------------------------- | ----------------------------------- | -------------------- |
| GET    | `/product-stocks`                | `warehouse_id`, `product_id`        | Остатки (фильтрация) |
| GET    | `/product-stocks/product/{id}`   | —                                   | Остатки товара       |
| GET    | `/product-stocks/warehouse/{id}` | —                                   | Остатки склада       |
| POST   | `/product-stocks/create`         | `{ warehouse_id, product_id, ... }` | Создать остаток      |
| PATCH  | `/product-stocks/{id}`           | `{ quantity?, reserved?, ... }`     | Обновить остаток     |
| DELETE | `/product-stocks/{id}`           | —                                   | Удалить остаток      |

---

## UI / Компоненты

### `/warehouses` — Справочник складов

**Функциональность:**

- Таблица складов (desktop + mobile)
- Фильтрация по названию, статусу (активные/неактивные)
- Создание/редактирование/удаление
- Флаг "Склад по умолчанию"
- Флаг "Публичный"
- Пагинация

**Форма модалки:**

```
Название:        [___________________________]
Город:           [___________________________]
Улица:           [___________________________]
Дом:             [___________________________]
Офис:            [___________________________]
Индекс:          [___________________________]
Район:           [___________________________]
Описание:        [___________________________]

[✓] Активен
[✓] Склад по умолчанию
[✓] Публичный (виден клиентам)
```

---

### Блок остатков в форме товара

**Расположение:** Форма редактирования/создания товара

**UI таблица остатков:**

| Склад           | Кол-во | Зарезервировано | Доступно | В наличии | Учёт |
| --------------- | ------ | --------------- | -------- | --------- | ---- |
| Москва          | [50]   | 10              | 40       | ✓         | [✓]  |
| Санкт-Петербург | [30]   | 5               | 25       | ✓         | [✓]  |
| Екатеринбург    | [0]    | 0               | 0        | ✗         | [✓]  |

**Колонки:**

- Склад — название склада
- Кол-во — общее количество (editable)
- Зарезервировано — readonly (системное поле)
- Доступно — readonly (calculated: quantity - reserved)
- В наличии — readonly (checkbox: available > 0)
- Учёт — checkbox (включить/выключить учёт количества)

**Функциональность:**

- Редактирование количества inline
- Включение/выключение учёта
- Автоматический расчёт available и in_stock

---

## Файловая структура (план)

```
src/app/warehouses/
├── page.tsx                                        # Server Component
├── action.ts                                       # Server Actions (CRUD)
├── schema.ts                                       # Zod схемы валидации
└── components/
    ├── WarehousesTableWrapper/
    │   └── WarehousesTableWrapper.tsx              # Client Component
    └── modal-warehouse-form/
        └── ModalWarehouseForm.tsx                 # Модалка формы

src/app/product/components/ProductForm/components/Stocks/
├── ProductFormStocks.tsx                          # Блок остатков в форме
└── ProductFormStocks.module.css
```

---

## Версионирование

| Версия | Дата       | Изменения                   |
| ------ | ---------- | --------------------------- |
| 1.0    | 2026-05-13 | Начальная версия (набросок) |

