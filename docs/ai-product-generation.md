# AI-генерация контента для карточки товара

Документ описывает расширение функционала AI-генерации на остальные блоки формы товара. Фронтенд: `shop-admin` (Next.js 16, React 19, CSS-модули, zod, zustand). Бэкенд: `shop-back` (NestJS, TypeORM). LLM — `OpenCodeService.query(prompt)` (CLI opencode).

> Статус (08.08.2026): **категория — ✅ готово** (бэкенд `suggest-category` + `apply-category-suggestion`, фронт actions + модалка); **полная информация по штрихкоду — ✅ готово (UI)** (кнопка в `ProductFormGeneralInfo` → `FullInfoSuggestionModal`, применение по всем секциям). Отдельные генерации по блокам (general-info / additional / specifications) **отменены** — полный парсер `search()` уже возвращает все поля разом, отдельные LLM-эндпоинты были бы дублированием. Обозначения: ✅ ГОТОВО, ◑ ЧАСТИЧНО, ⚠️ НЕ ГОТОВО, ✂️ ОТМЕНЕНО.

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
| `POST /product-source-record/generate-general-info` | `{ name, code?, description?, brand_name? }` | `{ description: string, brand_name: string }` | ✂️ ОТМЕНЕНО — дублирует полный парсер `search()` |
| `POST /product-source-record/generate-additional` | `{ name, description?, brand_name?, category_name? }` + текущие поля блока | `{ country, product_type, equipment, weight, height, length, width }` (`weight/height/length/width: number \| null`) | ✂️ ОТМЕНЕНО — дублирует полный парсер `search()` |
| `POST /product-source-record/generate-specifications` | `{ name, description?, brand_name?, category_name? }` | `{ specifications: [{ name, value }] }` | ✂️ ОТМЕНЕНО — дублирует полный парсер `search()` |
| `POST /product-source-record/suggest-category` | `{ name, description? }` | `{ category_id: number \| null, create_categories: [{ name, parent_id }] }` | Рекомендация категории (без побочных эффектов) ✅ ГОТОВО |
| `POST /product-source-record/apply-category-suggestion` | `{ category_id?: number \| null, create_categories?: [{ name, parent_id }] }` | `{ category_id: number }` | Выбрать существующую или создать цепочку ✅ ГОТОВО (принимает `create_categories` напрямую, без DTO-класса; `category_id`-ветка не используется — только создание цепочки) |

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
- `SuggestCategoryDto`: `name` + `description?`. ✅ ГОТОВО (`dto/suggest-category.dto.ts`)
- `ApplyCategorySuggestionDto`: `category_id?` (число > 0), `create_categories?` (массив `{ name: string, parent_id: number | null }`), валидация `@IsArray() @IsOptional()`. ⚠️ НЕ создан — контроллер принимает `{ name, parent_id }[]` инлайн (`product-source-record.controller.ts:67`).

### Рефакторинг `resolveCategory` (product-source-record.service.ts:158-291)
◑ ЧАСТИЧНО — логика переиспользуется (промпт построен через общий `formatCategoriesForPrompt` (стр. 294), парсинг и создание цепочки продублированы инлайн в `suggestCategory`/`applySuggestCategory`), но отдельные методы `buildCategoryPrompt` / `parseCategoryResponse` / `createCategoryChain` не выделены.

### Промпты
Образец — `generateSeo` (стр. 1142-1205): русский язык, «Верни ТОЛЬКО JSON в виде ...», fallback на пустые значения/null, `Object.hasOwn` проверки, `.catch` с `throw`.

- `generateGeneralInfo`: на основе name + code → описание 3-5 предложений (официальный стиль, без выдумок); `brand_name` — если передан, вернуть как есть.
- `generateAdditional`: country, product_type, equipment, weight/height/length/width (числа, без единиц; null если данных нет).
- `generateSpecifications`: 5-10 пар `{ name, value }`, только реальные атрибуты товара.
- `suggestCategory`: переиспользовать промпт `resolveCategory` (правила: не плодить категории, максимум 3-4 уровня вложенности), вход `{ name, description }`, рекомендуемый путь берётся из описания/названия. ✅ ГОТОВО (`product-source-record.service.ts:1205-1297`, расширенный промпт с примерами)

### Тесты
- `jest` на новые методы сервиса с моком `OpenCodeService.query` (см. `product-source-record`/`test` и существующие спеки). ⚠️ НЕ ГОТОВО — папка `test/` отсутствует, тестов на `suggestCategory`/`applySuggestCategory` нет
- Проверки: `npm run build`, линт/биом.

## 4. Фронтенд

### 4.1 Actions и типы (`src/app/product/action.ts`)
- Вынести `GenerateProductType` и `generateProductAction` из `import-from-pdf/action.ts` в `product/action.ts` (обновить импорт в `import-from-pdf`), чтобы кнопка штрихкода не зависела от модуля PDF. ✅ ГОТОВО — `GenerateProductType` + `generateProductAction` в `src/app/product/action.ts:372-414`, импорт в `ImportForm.tsx` обновлён.
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
  - `getCategorySuggestionAction` ✅ ГОТОВО (`src/app/product/action.ts:425-450`), `applyCategorySuggestionAction` ✅ ГОТОВО (`src/app/product/action.ts:452-473`).

### 4.2 Общий UI-каркас (композиция вместо дублирования)
✂️ ОТМЕНЕНО как отдельный шаг — вместо `SuggestionModal`/`SuggestionDiffRow` реализована единая `FullInfoSuggestionModal` (см. 4.3), построенная по паттерну `SeoRecommendationModal` (snapshot-паттерн, `getInitialSelected` с полной картой `false`, бейджи «Уже применено»/«Не предложено»).

### 4.3 Блоки формы
- **`ProductFormGeneralInfo.tsx`**:
  - Кнопка «Сгенерировать полную информацию» возле поля «Название» (disabled без валидного штрихкода `^\d{8,14}$`, спиннер, `AiSvg`) → вызов `generateProductAction(name, code)` из `ProductForm` → `FullInfoSuggestionModal`. ✅ ГОТОВО (`ProductFormGeneralInfo.tsx`, `FullInfoSuggestionModal/FullInfoSuggestionModal.tsx`)
  - Кнопка «Определить категорию» возле селектора категории (disabled без `name`) → `CategorySuggestionModal`: показывает рекомендуемую категорию (имя через `getCategoryName`) или «Будет создано: A → B → C»; кнопки «Выбрать» (если `category_id`) и «Создать и выбрать» (вызов `applyCategorySuggestionAction` → `handleSelectCategory(newId)`). ✅ ГОТОВО — кнопка + логика в `CategorySelect/CategorySelect.tsx`, модалка в `CategorySuggestionModal/CategorySuggestionModal.tsx` (показ рекомендуемой категории через `getCategoryFullPath`, цепочка «Будет создано», бейджи, пустое состояние «Не удалось определить категорию», кнопки «Выбрать»/«Создать и выбрать»). Реализовано без общего каркаса `SuggestionModal`.
- **`ProductFormAdditionally.tsx`**: ✂️ ОТМЕНЕНО — поля заполняются единой генерацией по штрихкоду.
- **`ProductFormSpecifications.tsx`**: ✂️ ОТМЕНЕНО — заполняется единой генерацией по штрихкоду.
- **Единая генерация «Полная информация»** (`ProductForm.tsx`): ✅ ГОТОВО
  - Кнопка в `ProductFormGeneralInfo` → `generateProductAction(values.name, values.code)`; на весь долгий запрос — спиннер/disabled (`generatingFullInfo`), при `error_message` из ответа — нотификация.
  - `FullInfoSuggestionModal` — модалка со всеми группами полей (Общие данные, Дополнительно, Характеристики, Категория, Фото товара, SEO). Каждая строка: чекбокс (по умолчанию отмечено всё, что предложено и отличается от текущего значения — включая уточнённое название; не отмечены «Не предложено»/«Уже применено»), диф «Текущее vs Предложенное», бейджи «Уже применено»/«Не предложено». Footer: «Отмена» / «Применить все» / «Применить выбранные (N)». «Применить все» не трогает штрих-код и не затирает поля пустыми значениями (применяются только строки с непустым `suggested`).
  - Применение (`handleApplyFullInfo`): строковые поля через `handleChangeValues`; габариты `number | null` → `String`/`""`; `specifications` через `setSpecificationsValues` (матч `name` со справочником → `specificationId`, новые строки → `specificationId: null`); `seo` → 7 полей; `photos` → `setPhotoValues` (дедуп по url).
  - **Категория определяется интерактивно прямо в модалке** (не слепым применением): блок «Категория» с кнопкой «Определить категорию» → `getCategorySuggestionAction` вызывается из самой модалки с **актуальными** name/description (из отмеченных строк с fallback на `currentValues`/`product` — это чинит баг устаревших `values` и пустой description, падавший на `min(3)` в `categorySuggestionSchema`). Результат inline: «Рекомендуемая категория» (путь через `getCategoryFullPath`) + кнопка «Выбрать», или «Будет создано: A → B → C» + «Создать и выбрать», или сообщение «Не удалось определить» с кнопкой «Изменить». Применение — `onApplyCategory` → `handleApplyCategory` (`category_id` → `handleSelectCategory`; цепочка → `applyCategorySuggestionAction` → `handleSelectCategory`).
  - Повторный клик при смене штрихкода = новый запрос (кэшируется на бэкенде в `product-source-record`).

### 4.4 Поток пропсов
`ProductForm` (`ProductForm.tsx`) уже прокидывает `values`, `errors`, `handleChangeValues`, `categories`, `specifications`, `setSpecificationsValues`, `setPhotoValues` в соответствующие секции — новые кнопки/модалки вписываются в существующие пропсы без изменения контракта.

## 5. Порядок реализации

1. **Бэкенд**: рефакторинг `resolveCategory` (buildCategoryPrompt / parseCategoryResponse / createCategoryChain) + 5 DTO + 5 методов сервиса + 5 эндпоинтов в контроллере + тесты. ◑ ЧАСТИЧНО — категория реализована (`suggestCategory`/`applySuggestCategory`), рефакторинг и тесты не завершены (см. раздел 3).
2. **Фронт**: вынести `GenerateProductType`/`generateProductAction`; новые типы и actions. ✅ ГОТОВО
3. **Фронт**: `SuggestionModal`/`SuggestionDiffRow` каркас; `GeneralInfo` + `Additionally` кнопки и модалки. ✂️ ОТМЕНЕНО — заменено единой `FullInfoSuggestionModal`.
4. **Фронт**: `SpecificationsSuggestionModal` (матч по именам). ✂️ ОТМЕНЕНО — характеристики заполняются единой генерацией.
5. **Фронт**: `CategorySuggestionModal` + apply. ✅ ГОТОВО
6. **Фронт**: кнопка «Сгенерировать полную информацию» (штрихкод) → `FullInfoSuggestionModal` + применение по всем секциям. ✅ ГОТОВО
7. Проверки и ручной прогон. ◑ НЕ ЗАВЕРШЕНО — tsc/eslint/prettier/stylelint чисты (кроме задокументированных предсуществующих ошибок), ручной прогон не проводился.

## 6. Проверки

- Фронт: `npx tsc --noEmit`, `npx eslint` (прямой запуск — `next lint` в Next 16 не работает), `npx prettier --check`, stylelint — после каждого шага.
- Бэкенд: `npm run build`, jest на новые методы, линт/биом.
- Не трогать: `src/app/product/components/ProductInfo/ProductInfo.tsx` + `.module.css` (правки пользователя), предсуществующие ошибки tsc (`create/action.ts:68` brand_id, `edit/[id]/page.tsx` updatePhotos, `main-mobile-table`).

## 7. Риски

- `search` по штрихкоду долгий (playwright + несколько LLM-вызовов) → обязателен спиннер/disabled (реализовано: `generatingFullInfo`); при неудаче показывать `error_message`. ✅ закрыто
- Определение категории зависит от названия и описания: раньше «постоянно не удавалось» из-за устаревших `values` в замыкании и пустого description (<3 символов в `categorySuggestionSchema`). ✅ закрыто — категория определяется прямо в модалке с актуальными данными; при неудаче показывается inline-причина и кнопка «Изменить» (без нотификации).
- LLM иногда возвращает невалидный JSON → единый парсер с fallback (как в `generateSeo`/`determineName`). Покрыто на бэкенде (`getProductOptions` → `null`, `validateParseProductInfo` → пустые строки).
- Новые характеристики без id создаются только при сабмите (паттерн `create/page.tsx:138-157`) — при применении из `FullInfoSuggestionModal` строки с `specificationId: null` уезжают в сабмит как новые.
- Создание категорий на лету — логика из `resolveCategory` (модерация не затрагивается).
- Кнопка «Сгенерировать полную информацию» требует валидный штрихкод (8-14 цифр) — без него disabled; название опционально.
