# Модуль: Specifications (Спецификации / Характеристики товаров)

## Контекст

**Цель:** Добавить к товарам структурированные характеристики.
**Бизнес-модель:** E-commerce с доставкой, розница/маркетплейс.

---

## Структура данных

### Specification (Спецификация — справочник имён)

```typescript
interface Specification {
  id: number;
  name: string;           // "Материал", "Срок годности", "Цвет"
  type: "text" | "color" | "number";  // Тип значения
  created_at: Date;
  updated_at: Date;
}
```

**Примеры:**
```json
{ "id": 1, "name": "Материал", "type": "text" }
{ "id": 2, "name": "Цвет", "type": "color" }
{ "id": 3, "name": "Вес", "type": "number" }
{ "id": 4, "name": "Срок годности", "type": "text" }
```

**Типы значений:**
| Тип | Описание | Пример значения |
|-----|----------|-----------------|
| `text` | Текстовое значение | "Пластик", "3 дня" |
| `color` | Цвет (hex/название) | "#FF5733", "Синий" |
| `number` | Числовое значение | "18", "2.5" |

---

## Привязка к товару

### ProductSpecification (Значение характеристики товара)

```typescript
interface ProductSpecification {
  id: number;
  product_id: number;      // FK → Product
  specification_id: number; // FK → Specification
  value: string;            // Значение характеристики
  created_at: Date;
  updated_at: Date;
}
```

**Примеры:**
```json
{ "product_id": 5, "specification_id": 1, "value": "Пластик" }
{ "product_id": 5, "specification_id": 2, "value": "#FF5733" }
{ "product_id": 12, "specification_id": 3, "value": "250" }
```

---

## API эндпоинты

### Specifications (справочник)

| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/specification` | Список всех спецификаций |
| GET | `/specification/{id}` | Получить одну спецификацию |
| POST | `/specification/create` | Создать новую спецификацию |
| PATCH | `/specification/{id}` | Обновить спецификацию |
| DELETE | `/specification/{id}` | Удалить спецификацию |

### ProductSpecifications (значения товара)

| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/product-specification?product_id={id}` | Получить все характеристики товара |
| POST | `/product-specification/create` | Добавить характеристику товару |
| PATCH | `/product-specification/{id}` | Обновить значение характеристики |
| DELETE | `/product-specification/{id}` | Удалить характеристику товара |
| POST | `/product-specification/bulk` | Массовое создание/обновление |

---

## Страницы админки

### 1. `/specifications` — Справочник спецификаций

**Назначение:** CRUD для справочника спецификаций (название + тип).

**UI-элементы:**
- Таблица спецификаций (desktop + mobile)
- Фильтр по типу (text/color/number)
- Модалка создания/редактирования

**Форма создания/редактирования:**
```
Название: [Материал____________]
Тип:      [Выберите тип___▼    ]
           ○ text    ○ color    ○ number
```

---

### 2. Блок спецификаций на странице редактирования товара

**Назначение:** Добавление/редактирование характеристик直接在 странице товара.

**User flow:**
1. Админ открывает `/product/edit/[id]`
2. Видит блок "Спецификации" в форме
3. Нажимает "Добавить спецификацию"
4. Выбирает из справочника → вводит значение
5. Сохраняет товар

**UI-элементы:**
- Список спецификаций (имя → значение)
- Кнопка "Добавить спецификацию"
- Форма: select (имя) + input (значение, тип зависит от спецификации)
- Inline-редактирование
- Кнопка удаления

**Рендеринг значения по типу:**
| Тип | UI |
|-----|-----|
| `text` | Input (text) |
| `color` | Input (color) или color picker |
| `number` | Input (number) |

---

## Компоненты (файловая структура)

### Справочник

```
src/app/specifications/
├── page.tsx                    # Server Component
├── action.ts                   # Server Actions (CRUD)
├── schema.ts                    # Zod схемы валидации
├── components/
│   ├── SpecificationsTableWrapper/
│   │   ├── SpecificationsTableWrapper.tsx
│   │   └── SpecificationsTableWrapper.module.css
│   └── modal-specification-form/
│       ├── ModalSpecificationForm.tsx
│       └── ModalSpecificationForm.module.css
└── Specifications.module.css
```

### Блок в ProductForm

```
src/app/product/components/ProductFormSpecifications/
├── ProductFormSpecifications.tsx
├── ProductFormSpecifications.module.css
├── SpecificationItem.tsx
└── AddSpecificationForm.tsx
```

---

## Роутинг

```
/specifications              → Справочник спецификаций
/product/create              → Блок спецификаций в форме
/product/edit/[id]            → Блок спецификаций в форме
```

---

## Вопросы для уточнения

1. **Цвет (`color`):** Какой формат хранить? Hex (#RRGGBB) или названия цветов?

2. **Числа (`number`):** Нужна ли единица измерения (unit)? Если да — хранить в справочнике или в значении?

3. **Мультизначение:** Может ли одна спецификация иметь несколько значений (массив)? Например, "Цвет: Синий, Красный".

4. **Удаление спецификации:** При удалении из справочника — что делать с связанными ProductSpecification?
   - CASCADE delete
   - Запретить удаление если есть связи
   - Пометить как "удалённая" (soft delete)

---

## Версионирование

| Версия | Дата | Изменения |
|--------|------|-----------|
| 1.0 | 2026-05-11 | Начальная версия |
