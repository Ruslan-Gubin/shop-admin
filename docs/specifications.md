# Модуль: Specifications (Характеристики товаров)

## Контекст

**Цель:** Справочник характеристик с типами (text/color/number) + привязка значений к товарам.
**Бизнес-модель:** E-commerce с доставкой, розница/маркетплейс.

---

## Структура данных

### Specification (Справочник — название и тип характеристики)

```typescript
interface SpecificationModel {
  id: number;
  name: string; // "Материал", "Срок годности", "Цвет"
  type: "text" | "color" | "number"; // Тип значения
  created_at: string; // ISO Date
  updated_at: string | null;
}
```

**Валидация (Zod):**

- `name`: строка 2-100 символов
- `type`: один из: `text`, `color`, `number`

**Примеры:**

```json
{ "id": 1, "name": "Материал", "type": "text", "created_at": "2026-05-11T10:00:00Z" }
{ "id": 2, "name": "Цвет", "type": "color", "created_at": "2026-05-11T10:00:00Z" }
{ "id": 3, "name": "Вес", "type": "number", "created_at": "2026-05-11T10:00:00Z" }
```

**Типы значений:**

| Тип      | Описание            | UI в форме товара               |
| -------- | ------------------- | ------------------------------- |
| `text`   | Текстовое значение  | `<input type="text">`           |
| `color`  | Цвет (hex/название) | `<input type="text">` с поиском |
| `number` | Числовое значение   | `<input type="number">`         |

---

### ProductSpecification (Значение характеристики товара)

```typescript
interface ProductSpecificationModel {
  id: number;
  product_id: number; // FK → Product
  specification_id: number; // FK → Specification
  value: string; // Значение характеристики
  specification: SpecificationModel; // Связанная спецификация
  created_at: Date;
  updated_at: Date | null;
}
```

**Примеры:**

```json
{
  "id": 1,
  "product_id": 5,
  "specification_id": 1,
  "value": "Пластик",
  "specification": { "id": 1, "name": "Материал", "type": "text" }
}
{
  "id": 2,
  "product_id": 5,
  "specification_id": 2,
  "value": "#FF5733",
  "specification": { "id": 2, "name": "Цвет", "type": "color" }
}
```

---

## API эндпоинты

### Specifications (справочник)

| Метод  | URL                      | Параметры               | Описание                          |
| ------ | ------------------------ | ----------------------- | --------------------------------- |
| GET    | `/specifications`        | `name`, `limit`, `page` | Список с фильтрацией и пагинацией |
| GET    | `/specifications/{id}`   | —                       | Одна спецификация по ID           |
| POST   | `/specifications/create` | `{ name, type }`        | Создать новую                     |
| PATCH  | `/specifications/{id}`   | `{ name?, type? }`      | Обновить                          |
| DELETE | `/specifications/{id}`   | —                       | Удалить                           |

### ProductSpecifications (значения в товаре)

| Метод  | URL                              | Параметры                                 | Описание                       |
| ------ | -------------------------------- | ----------------------------------------- | ------------------------------ |
| POST   | `/product-specifications/create` | `{ product_id, specification_id, value }` | Добавить характеристику товару |
| PATCH  | `/product-specifications/{id}`   | `{ value }`                               | Обновить значение              |
| DELETE | `/product-specifications/{id}`   | —                                         | Удалить характеристику         |

---

## UI / Компоненты

### Справочник `/specifications`

**Страница:** `src/app/specifications/page.tsx`

**Компоненты:**

- `SpecificationTableWrapper` — обёртка таблицы (desktop + mobile)
- `SpecificationModalForm` — модалка создания/редактирования

**Функциональность:**

- Таблица с колонками: ID, Название, Тип, Дата создания
- Тип отображается как перевод: `text` → "Текст", `color` → "Цвет", `number` → "Число"
- Фильтрация по названию
- Пагинация (по 10 на страницу)
- Создание/редактирование в модалке
- Удаление с подтверждением

**Форма модалки:**

```
Название: [_________________]  ← Input
Тип:      [Текст___________▼] ← Select (text/color/number)
```

### Блок в форме товара

**Компонент:** `src/app/product/components/ProductForm/components/Specifications/`

**Структура:**

- `ProductFormSpecifications.tsx` — основной компонент
- `DropdownSearchWrapper.tsx` — поиск + выбор характеристики

**Функциональность:**

- Динамическое добавление/удаление строк характеристик
- Поиск характеристики в справочнике (debounce 3+ символов)
- Фильтрация: уже выбранные характеристики скрыты из списка
- Создание новой характеристики "на лету": если ввести название не из справочника → создаётся новая с типом `text` и сразу привязывается к товару

**UI строки характеристики:**

```
[Характеристика ▼]  [Значение________]  [×]
     ↑ DropdownSearch    ↑ Input (text/number)
```

**SpecificationValueItem (внутренняя модель формы):**

```typescript
interface SpecificationValueItem {
  listId: number; // ID строки в UI (для управления)
  specificationId: number | null; // ID из справочника
  label: string; // Название (для новых характеристик)
  value: string; // Значение
}
```

---

## Файловая структура

```
src/app/specifications/
├── page.tsx                                        # Server Component (список)
├── action.ts                                       # Server Actions (CRUD)
├── schema.ts                                       # Zod схемы валидации
└── components/
    ├── SpecificationTableWrapper/
    │   └── SpecificationWrapper.tsx               # Client Component (таблица)
    └── SpecificationModalForm/
        └── SpecificationModalForm.tsx             # Модалка формы

src/app/product/components/ProductForm/components/Specifications/
├── ProductFormSpecifications.tsx                   # Блок характеристик
├── DropdownSearchWrapper.tsx                       # Поиск/выбор
├── ProductFormSpecifications.module.css
└── DropdownSearchWrapper.module.css
```

---

## Логика сохранения характеристик товара

### Создание товара (`create/action.ts`)

Характеристики пока не сохраняются при создании товара — только при редактировании.

### Редактирование товара (`edit/[id]/action.ts`)

Функция `updateProductSpecifications`:

```
Для каждой строки из формы:
  1. Если specificationId есть и value изменилось → PATCH
  2. Если productSpecification есть и value пусто → DELETE
  3. Если specificationId есть и value есть, но productSpecification нет → POST
  4. Если specificationId нет, но есть label + value → создать новую спецификацию + POST

Для каждой существующей связи productSpecifications:
  5. Если нет соответствующей строки в форме → DELETE
```

---

## Версионирование

| Версия | Дата       | Изменения                                         |
| ------ | ---------- | ------------------------------------------------- |
| 1.0    | 2026-05-11 | Начальная версия                                  |
| 1.1    | 2026-05-13 | Обновлена документация: структура данных, API, компоненты |

