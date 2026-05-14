# Модуль "Склады"

## Общее описание

Модуль управления складами позволяет создавать, редактировать и удалять склады, а также управлять остатками товаров на каждом складе.

## Структура URL

| Роут | Описание |
|------|----------|
| `/warehouses` | Список складов (таблица с поиском и пагинацией) |
| `/warehouses/create` | Создание нового склада |
| `/warehouses/edit/[id]` | Редактирование существующего склада |

## Модель данных

### WarehouseModel

```typescript
type WarehouseModel = {
  id: number;
  name: string;                    // Название склада
  address: string;                 // Полный адрес
  area: string;                    // Район
  city: string;                    // Город
  street: string;                  // Улица
  house: string;                   // Дом
  index: string;                   // Почтовый индекс
  office: string;                  // Офис/Квартира
  description: string;             // Описание
  create_user_id: number;          // ID создателя
  is_active: boolean;              // Активен (по умолчанию true)
  default_warehouse: boolean;      // Склад по умолчанию
  is_public: boolean;               // Публичный (виден клиентам, по умолчанию true)
  created_at: string;
  updated_at: string | null;
};
```

### WarehousePayload (для создания/обновления)

```typescript
type WarehousePayload = {
  name: string;
  address: string;
  area: string;
  city: string;
  street: string;
  house: string;
  index: string;
  office: string;
  description: string;
  is_active: boolean;
  default_warehouse: boolean;
  is_public: boolean;
};
```

## Валидация (Zod Schema)

### createWarehouseSchema

| Поле | Правила |
|------|---------|
| `name` | Обязательно, 2-100 символов |
| `address` | Максимум 200 символов |
| `area` | Максимум 100 символов |
| `city` | Максимум 100 символов |
| `street` | Максимум 200 символов |
| `house` | Максимум 50 символов |
| `index` | Максимум 20 символов |
| `office` | Максимум 50 символов |
| `description` | Максимум 1000 символов |
| `is_active` | boolean |
| `default_warehouse` | boolean |
| `is_public` | boolean |

## API Endpoints (fetchService)

| Метод | URL | Описание |
|-------|-----|----------|
| `GET` | `warehouses` | Получить список складов (params: limit, page, name) |
| `GET` | `warehouses/${id}` | Получить один склад по ID |
| `POST` | `warehouses/create` | Создать новый склад |
| `PATCH` | `warehouses/${id}` | Обновить склад |
| `DELETE` | `warehouses/${id}` | Удалить склад |

## Компоненты

### 1. WarehousesTableWrapper

**Путь:** `src/app/warehouses/components/WarehousesTableWrapper/WarehousesTableWrapper.tsx`

Обёртка таблицы с модальным окном удаления.

**Props:**
```typescript
type Props = {
  warehouses: WarehouseModel[];
  onDeleteItemAction: (id: number) => Promise<{ status: "error" | "success"; message: string }>;
  redirectPageAfterDeleteAction: () => void;
  name: string;
  isLoadMoreDisabled: boolean;
  patch: string;
  searchParams: { [key: string]: string | string[] | undefined };
  fetchTableElementAction: (id: string) => Promise<ResponseData<WarehouseModel>>;
};
```

**Функционал:**
- Отображение данных в таблице (Desktop) или мобильной таблице (Mobile)
- Редактирование по клику на строку → редирект на `/warehouses/edit/${id}`
- Удаление с подтверждением через модальное окно
- Поиск по названию
- Пагинация

**Колонки таблицы:**
| ID | Название | Адрес | Город | Активен | Публичный | Склад по умолчанию | Действия |
|----|----------|-------|-------|---------|-----------|---------------------|----------|
| id | name | address | city | boolean (Да/Нет) | boolean (Да/Нет) | boolean (Да/Нет) | Edit/Delete |

**Grid layout:** `65px minmax(150px, 1fr) minmax(120px, 180px) minmax(100px, 150px) 100px 100px 170px 58px`

### 2. WarehouseForm

**Путь:** `src/app/warehouses/components/WarehouseForm/WarehouseForm.tsx`

Форма создания/редактирования склада.

**Props:**
```typescript
type Props = {
  submitAction: (payload: WarehousePayload) => Promise<{
    errors: Record<keyof WarehousePayload, string> | null;
    notification: { status: "error" | "success"; message: string } | null;
    updateValues: WarehousePayload | null;
  }>;
  initValues: WarehousePayload;
  initErrors: Record<keyof WarehousePayload, string>;
  variant: "create" | "edit";
};
```

**Поля формы:**
| Поле | Тип | Обязательно | Описание |
|------|-----|-------------|----------|
| Название | Input | Да | 2-100 символов |
| Полный адрес | Input | Нет | До 200 символов |
| Город | Input | Нет | До 100 символов |
| Улица | Input | Нет | До 200 символов |
| Дом | Input | Нет | До 50 символов |
| Офис/Квартира | Input | Нет | До 50 символов |
| Почтовый индекс | Input | Нет | До 20 символов |
| Район | Input | Нет | До 100 символов |
| Описание | Input | Нет | До 1000 символов |
| Активен | Checkbox | Нет | По умолчанию true |
| Публичный (виден клиентам) | Checkbox | Нет | По умолчанию true |
| Склад по умолчанию | Checkbox | Нет | По умолчанию false |

**Начальные значения (create):**
```typescript
{
  name: "",
  address: "",
  area: "",
  city: "",
  street: "",
  house: "",
  index: "",
  office: "",
  description: "",
  is_active: true,
  default_warehouse: false,
  is_public: true,
}
```

## Экшены (Server Actions)

### 1. fetchWarehouses

```typescript
fetchWarehouses(limit: string, page?: string, name?: string): Promise<FetchWarehousesResponse>
```

**Response:**
```typescript
{
  paginationPage: string;
  warehouses: WarehouseModel[];
  totalCount: number;
}
```

### 2. fetchWarehouse

```typescript
fetchWarehouse(id: string): Promise<ResponseData<WarehouseModel>>
```

### 3. createWarehouseAction

```typescript
createWarehouseAction(payload: WarehousePayload): Promise<{
  status: "error" | "success";
  errors: Record<keyof WarehousePayload, string>;
  data: WarehouseModel | null;
}>
```

### 4. updateWarehouseAction

```typescript
updateWarehouseAction(payload: WarehousePayload, id: string): Promise<{
  status: "error" | "success";
  errors: Record<keyof WarehousePayload, string>;
}>
```

### 5. deleteWarehouseAction

```typescript
deleteWarehouseAction(id: number): Promise<{ status: "error" | "success"; message: string }>
```

**Особенности:**
- Инвалидирует тег `Warehouses`
- Удаляет cookie после успешного удаления
- Редиректит на предыдущую страницу если удалён последний элемент

## Интеграция с Product Stock

Модуль складов связан с товарами через остатки (`product-stock`):

| Экшен | URL | Описание |
|-------|-----|----------|
| `createProductStock` | `product-stock/create` | Создать остаток товара на складе |
| `updateProductStock` | `product-stock/${id}` | Обновить остаток |
| `deleteProductStock` | `product-stock/${id}` | Удалить остаток |

**ProductStockModel:**
```typescript
type ProductStockModel = {
  id: number;
  warehouse_id: number;
  product_id: number;
  quantity: number;
  reserved: number;
  available: number;
  in_stock: boolean;
  accounting: boolean;
  created_at: string;
  updated_at: string | null;
};
```

## Связь с навигацией

Модуль доступен из меню:
- **Склады** `/warehouses` — иконка `WarehousesSvg`
- **Создать склад** `/warehouses/create` — дочерний пункт меню

## Кэширование

- Тег `Warehouses` — для инвалидации списка складов
- Тег `Warehouses_${id}` — для инвалидации конкретного склада

## Примечания

1. При удалении последнего склада на странице происходит редирект на предыдущую страницу
2. Редактирование товара (`product/edit`) триггерит revalidatePath после успешного обновления склада
3. Все операции используют fetchService с автоматическим обновлением токенов