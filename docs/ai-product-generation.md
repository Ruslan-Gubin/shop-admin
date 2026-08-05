# AI-генерация контента для карточки товара

Документ описывает расширение функционала AI-генерации на остальные блоки формы товара. Фронтенд: `shop-admin` (Next.js 16, React 19, CSS-модули, zod, zustand). Бэкенд: `shop-back` (NestJS, TypeORM). LLM — `OpenCodeService.query(prompt)` (CLI opencode).

## 1. Что уже готово

### Фронтенд (`src/app/product`)
- **SEO-генерация** — эталонный паттерн, по которому делаются остальные блоки:
  - `components/ProductForm/components/Seo/ProductFormSeo.tsx` — кнопка «Сгенерировать SEO» (disabled без `name`, спиннер, `AiSvg`), payload собирается инлайн, ответ маппится по каждому полю с fallback `|| ""`.
  - `components/ProductForm/components/Seo/SeoRecommendationModal.tsx` — модалка рекомендаций: диф «Текущее vs Предложенное», чекбоксы, бейджи «Уже применено»/«Не предложено», кнопки «Отмена» / «Применить все» / «Применить выбранные (N)».
  - Ключевые детали паттерна: `getInitialSelected` всегда возвращает полную карту `Record<SeoKey, boolean>` (со `false` по умолчанию) — иначе чекбоксы становятся uncontrolled (ошибка React); сброс выбора выполняется паттерном «adjust state during render» (snapshot props), без setState в эффектах.
  - `action.ts` — `SeoModel`, `SeoSuggestionPayload`, `getSeoSuggestionAction` (`fetchService.post<SeoModel>` + `updateTokensInAction`).
- Существующие actions для штрихкода (`src/app/product/import-from-pdf/action.ts`):
  - `generateProductAction(name, barcode)` → `POST product-source-record`, ответ `{ clear_name, product: GenerateProductType, error_message }`.
  - `GenerateProductType` — полный JSON товара: `name, code, description, product_type, equipment, brand_name, category_name, country, weight, height, length, width, specifications: [{name, value}], seo: {...}, photos: []`.
  - `getParsePhotoAction(name)` → `GET product-source-record/pick-images?query=...`.

### Бэкенд (`shop-back/src/product-source-record`)
- `POST /product-source-record/generate-seo` — реализован (`generateSeo(dto)`).
- `POST /product-source-record` — `search()`: по штрихкоду ищет/создаёт запись, собирает название из интернета, `getProductOptions` возвращает полный product JSON.
- `GET pick-images` — подбор фото по запросу.
- `resolveCategory(productName, recommendedPath)` — LLM выбирает существующую категорию или создаёт цепочку на лету (используется только внутри `createProductFromRecord`). Содержит переиспользуемую логику: построение промпта со списком категорий, парсинг JSON, создание цепочки через `categoryService.validateCategoryChain` + `create`.

## 2. Подтверждённые UX-решения

1. **Отдельные кнопки «Сгенерировать» в каждой секции** (как SEO) + модалка с дифом «Текущее vs Предложенное», чекбоксами (включены только пустые поля), бейджами «Уже применено»/«Не предложено».
2. **Категория**: модалка с двумя действиями — «Выбрать существующую» (category_id) и «Создать недостающие и выбрать» (цепочка создаётся на бэкенде на лету).
3. **Штрихкод**: переиспользовать существующий пайплайн `search` + `pick-images`, заполнять все блоки.
4. **Фото включаются** в «заполнить по штрихкоду».

## 3. Бэкенд: новые эндпоинты

Все эндпоинты: `@Roles("admin", "moderator")` + `RolesGuard`, ответ в обёртке `responseData(data, "success", [], message)`.

| Эндпоинт | DTO (вход) | Ответ `data` | Назначение |
|---|---|---|---|
| `POST /product-source-record/generate-general-info` | `{ name, code?, description?, brand_name? }` | `{ description: string, brand_name: string }` | «Общие данные»: описание + бренд |
| `POST /product-source-record/generate-additional` | `{ name, description?, brand_name?, category_name? }` + текущие поля блока | `{ country, product_type, equipment, weight, height, length, width }` (`weight/height/length/width: number \| null`) | «Дополнительно» |
| `POST /product-source-record/generate-specifications` | `{ name, description?, brand_name?, category_name? }` | `{ specifications: [{ name, value }] }` | «Характеристики» |
| `POST /product-source-record/suggest-category` | `{ name, description? }` | `{ category_id: number \| null, create_categories: [{ name, parent_id }] }` | Рекомендация категории (без побочных эффектов) |
| `POST /product-source-record/apply-category-suggestion` | `{ category_id?: number \| null, create_categories?: [{ name, parent_id }] }` | `{ category_id: number }` | Выбрать существующую или создать цепочку |

### DTO (папка `dto/`, class-validator)
Образец — `generate-seo.dto.ts`:
```ts
export class GenerateGeneralInfoDto {
  @IsString() @IsNotEmpty({ message: "Укажите название товара" }) name: string;
  @IsString() @IsOptional() code?: string;
  @IsString() @IsOptional() description?: string;
  @IsString() @IsOptional() brand_name?: string;
}
```
- `GenerateAdditionalDto`: `name` + `description?`, `brand_name?`, `category_name?` + текущие поля блока (country, product_type, equipment, weight, height, length, width — строки, `@IsOptional()`).
- `GenerateSpecificationsDto`: `name` + `description?`, `brand_name?`, `category_name?`.
- `SuggestCategoryDto`: `name` + `description?`.
- `ApplyCategorySuggestionDto`: `category_id?` (число > 0), `create_categories?` (массив `{ name: string, parent_id: number | null }`), валидация `@IsArray() @IsOptional()`.

### Рефакторинг `resolveCategory` (product-source-record.service.ts:158-291)
Вынести в приватные переиспользуемые методы:
- `buildCategoryPrompt(context: { name, description?, recommendedPath? }, categoriesTree)` — построение промпта (расширить: сейчас промпт принимает только `recommendedPath`, для `suggest-category` нужен ещё `description`).
- `parseCategoryResponse(text)` → `{ category_id: number | null, create_categories: [...] }` (парсинг `/\{[\s\S]*\}/`, проверки `Object.hasOwn`).
- `createCategoryChain(create_categories)` → финальный `category_id` (код из стр. 256-285: `validateCategoryChain`, цикл создания с `getChildren`/`position`).
- `resolveCategory` и новые `suggestCategory`/`applyCategorySuggestion` используют эти методы.

### Промпты
Образец — `generateSeo` (стр. 1142-1205): русский язык, «Верни ТОЛЬКО JSON в виде ...», fallback на пустые значения/null, `Object.hasOwn` проверки, `.catch` с `throw`.

- `generateGeneralInfo`: на основе name + code → описание 3-5 предложений (официальный стиль, без выдумок); `brand_name` — если передан, вернуть как есть.
- `generateAdditional`: country, product_type, equipment, weight/height/length/width (числа, без единиц; null если данных нет).
- `generateSpecifications`: 5-10 пар `{ name, value }`, только реальные атрибуты товара.
- `suggestCategory`: переиспользовать промпт `resolveCategory` (правила: не плодить категории, максимум 3-4 уровня вложенности), вход `{ name, description }`, рекомендуемый путь берётся из описания/названия.

### Тесты
- `jest` на новые методы сервиса с моком `OpenCodeService.query` (см. `product-source-record`/`test` и существующие спеки).
- Проверки: `npm run build`, линт/биом.

## 4. Фронтенд

### 4.1 Actions и типы (`src/app/product/action.ts`)
- Вынести `GenerateProductType` и `generateProductAction` из `import-from-pdf/action.ts` в `product/action.ts` (обновить импорт в `import-from-pdf`), чтобы кнопка штрихкода не зависела от модуля PDF.
- Новые типы (плоские ответы, как `SeoModel`):
```ts
export type GeneralInfoSuggestion = { description: string; brand_name: string };
export type AdditionalSuggestion = {
  country: string; product_type: string; equipment: string;
  weight: string | null; height: string | null; length: string | null; width: string | null;
};
export type SpecificationsSuggestion = { specifications: { name: string; value: string }[] };
export type CategorySuggestion = {
  category_id: number | null;
  create_categories: { name: string; parent_id: number | null }[];
};
```
- Новые actions (паттерн `getSeoSuggestionAction`):
  - `getGeneralInfoSuggestionAction`, `getAdditionalSuggestionAction`, `getSpecificationsSuggestionAction` — payload как у бэкенд-DTO;
  - `getCategorySuggestionAction`, `applyCategorySuggestionAction`.

### 4.2 Общий UI-каркас (композиция вместо дублирования)
Из `SeoRecommendationModal` выделить переиспользуемое:
- `SuggestionModal` — shell: `Modal`/`ModalHeader`/`ModalBody`, footer «Отмена» / «Применить все» / «Применить выбранные (N)», состояние выбора (snapshot-паттерн + `Object.fromEntries` со `false`).
- `SuggestionDiffRow` — строка: чекбокс + label, диф «Текущее vs Предложенное», бейджи.

Специфические body: `GeneralInfoSuggestionModal`, `AdditionalSuggestionModal`, `SpecificationsSuggestionModal`. SEO-модалку перевести на каркас или оставить (минимальные изменения — на усмотрение).

### 4.3 Блоки формы
- **`ProductFormGeneralInfo.tsx`**:
  - Кнопка «Сгенерировать описание» (disabled без `name`, спиннер, `AiSvg`) → `GeneralInfoSuggestionModal` (поля `description`, `brand_name`).
  - Кнопка «Определить категорию» возле селектора категории (disabled без `name`) → `CategorySuggestionModal`: показывает рекомендуемую категорию (имя через `getCategoryName`) или «Будет создано: A → B → C»; кнопки «Выбрать» (если `category_id`) и «Создать и выбрать» (вызов `applyCategorySuggestionAction` → `handleSelectCategory(newId)`).
- **`ProductFormAdditionally.tsx`**: кнопка «Сгенерировать» → `AdditionalSuggestionModal`; при применении `number | null` конвертировать в строки (`String` / `""`).
- **`ProductFormSpecifications.tsx`**: кнопка «Сгенерировать характеристики» → `SpecificationsSuggestionModal`. Применение: матч `name` с `props.specifications` (найден → `specificationId`, иначе `label` + `specificationId: null`); новые строки добавляются через `setSpecificationsValues`; перезапись совпавших строк по согласию (как в SEO-паттерне).
- **Заполнение по штрихкоду**: кнопка возле поля «Штрих-код» (loading на весь долгий запрос). Вызов `generateProductAction(name, barcode)` → заполнить:
  - `name` (из `clear_name`), `description`, `brand_name`, `country`, `product_type`, `equipment`, `weight/height/length/width` (числа → строки);
  - `specifications` → `specificationValues` (матч по имени);
  - `seo` → 7 полей;
  - `category_name` → если есть, запустить `getCategorySuggestionAction` и открыть модалку категории;
  - затем `getParsePhotoAction(name)` → `photoValues`.
  - Если часть полей заполнена — подтверждение перезаписи (например `window.confirm`); при ошибке показать `error_message` из ответа.

### 4.4 Поток пропсов
`ProductForm` (`ProductForm.tsx`) уже прокидывает `values`, `errors`, `handleChangeValues`, `categories`, `specifications`, `setSpecificationsValues`, `setPhotoValues` в соответствующие секции — новые кнопки/модалки вписываются в существующие пропсы без изменения контракта.

## 5. Порядок реализации

1. **Бэкенд**: рефакторинг `resolveCategory` (buildCategoryPrompt / parseCategoryResponse / createCategoryChain) + 5 DTO + 5 методов сервиса + 5 эндпоинтов в контроллере + тесты.
2. **Фронт**: вынести `GenerateProductType`/`generateProductAction`; новые типы и actions.
3. **Фронт**: `SuggestionModal`/`SuggestionDiffRow` каркас; `GeneralInfo` + `Additionally` кнопки и модалки.
4. **Фронт**: `SpecificationsSuggestionModal` (матч по именам).
5. **Фронт**: `CategorySuggestionModal` + apply.
6. **Фронт**: кнопка «Заполнить по штрихкоду».
7. Проверки и ручной прогон.

## 6. Проверки

- Фронт: `npx tsc --noEmit`, `npx eslint` (прямой запуск — `next lint` в Next 16 не работает), `npx prettier --check`, stylelint — после каждого шага.
- Бэкенд: `npm run build`, jest на новые методы, линт/биом.
- Не трогать: `src/app/product/components/ProductInfo/ProductInfo.tsx` + `.module.css` (правки пользователя), предсуществующие ошибки tsc (`create/action.ts:68` brand_id, `edit/[id]/page.tsx` updatePhotos, `main-mobile-table`).

## 7. Риски

- `search` по штрихкоду долгий (playwright + несколько LLM-вызовов) → обязателен спиннер/disabled; при неудаче показывать `error_message`.
- LLM иногда возвращает невалидный JSON → единый парсер с fallback (как в `generateSeo`/`determineName`).
- Новые характеристики без id создаются только при сабмите (паттерн `create/page.tsx:138-157`) — для режима «edit» (`edit/[id]`) уточнить поведение сабмита на этапе 4.
- Создание категорий на лету — логика из `resolveCategory` (модерация не затрагивается).
