# Перенос `search` / генерации карточки товара на клиент

> Статус (06.10.2026): **план, реализация не начата.**
> Цель: вся генерация LLM (`search`, определение имени, парсинг страниц, `getProductOptions`) и весь скрейпинг переезжают в `shop-admin`. `shop-back` **не переписываем** — он остаётся эталоном поведения. Записи генерации (`product_source_record`) в будущем должны сохраняться на бэке — механизм отложен (см. «Отложено»).
> Обозначения: ◑ В РАБОТЕ, ✅ ГОТОВО, ⚠️ НЕ ГОТОВО, ⏸ ОТЛОЖЕНО.

## 0. Почему так

- Клиентская LLM уже работает и проверена: `generateAnswer` → `http://localhost:8080/v1/chat/completions`, модель `gemma-4-E2B_q4_0-it` (см. `src/shared/llm/generateAnswer.ts`). Промпты SEO/категории уже перенесены (`src/app/product/prompt.ts`).
- Бэкендный `search` (`shop-back/src/product-source-record/product-source-record.service.ts:368-455`) — оркестратор с 4 LLM-вызовами и скрейпингом; его переносим пошагово.
- Требования: **мелкие порции с параллельной проверкой в UI**; единообразие файлов (стиль `prompt.ts`: `"use server"`, относительные пути, `import type`); контракт `generateAnswer<T>` жёстко бросает ошибку, если в JSON нет ключа `answer` (`generateAnswer.ts:42`).

## 1. Контракт новой функции

Папка: **`src/app/product/generate/`**.

```ts
// сигнатура совместима с текущим generateProductAction (src/app/product/action.ts:398),
// чтобы замена в UI = смена импорта
generateProductData(name: string, barcode: string): Promise<{
  status: "success" | "error";
  message: string;
  data?: { clear_name: string; product: GenerateProductType | null; error_message: string };
}>
```

Оркестратор повторяет логику `search` по шагам:
валидация barcode → источники названий → LLM-имя (`clear_name`) → поиск страниц → валидация страниц → `getProductOptions` → результат (правила слияния ошибок — дословно с бэка, `service:416-455`).

## 2. Структура файлов

```
src/app/product/generate/
  index.ts     — generateProductData (оркестратор) + asyncPool
  names.ts     — 4 источника названий + клиентский findAndFormattedProductName
  pages.ts     — DuckDuckGo-поиск + fetch страниц + клиентский validateParseProductInfo
  prompts.ts   — промпты: determineName, formattedName, validateParseProductInfo, getProductOptions
```

Стиль — как у существующих промпт-файлов (`src/app/product/prompt.ts`, `src/app/product-questions/prompt.ts`): `"use server"`, относительные пути, `import type`.

## 3. Известные блокеры (проверены экспериментально)

### 3.1 CORS — браузер не читает ответы большинства источников

| Источник | ACAO-заголовок | Доступен из браузера |
| --- | --- | --- |
| `ean-online.ru/match.php` (POST + `X-Requested-With`) | нет → preflight отклонён | ❌ |
| `ru.disai.org/?search_query=` | `Access-Control-Allow-Origin: *` | ✅ |
| `barcode-list.ru/barcode/RU/…` | нет | ❌ |
| `market.yandex.ru/search?text=` | нет | ❌ |
| `duckduckgo.com/html/?q=` | нет | ❌ |
| страницы товаров | нет | ❌ |

**План:** сначала пробуем честный браузерный fetch (порция 1) и смотрим в UI. Если подтвердится — слой fetch (один файл) переносим в **server action внутри shop-admin**: код остаётся «на клиенте» (проект shop-admin), бэкенд не трогаем. Альтернатива — route handler `src/app/api/*` (в проекте сейчас отсутствует).

### 3.2 Playwright в браузере невозможен

Бэкенд рендерит страницы через Playwright (`service:458-527`): `waitUntil: "load"` → прокрутка → `sleep(2–5 c)` → `document.body.innerText` + сбор фото из network-трафика (`page.on("response")`).

**План:** пробуем на клиенте `fetch` HTML → вырезаем `script/style/noscript` → `textContent` с `\n` на block-элементах → те же regex-чистки (`service:496-520`). Фото вместо network-трафика: `<img src|data-src>`, `srcset`, `og:image`. Если заметно хуже Playwright — отдельно решаем (Playwright в shop-admin / server action), **не в основной линии**.

### 3.3 cheerio → DOMParser

На клиенте cheerio нет (в `package.json` только next/react/zod/zustand/pdf2json/mapbox). Переносим селекторы:

| Бэкенд (cheerio) | Клиент (DOMParser) |
| --- | --- |
| disai: `tr[bgcolor='#e0e8f2']` + `td:first-child font` text-узлы | `querySelectorAll`, обход `#text`-узлов (аналог `node.type === "text"`) |
| barcode-list: `table.randomBarcodes tr.even, tr.odd` → `td:nth-child(3)` | `querySelectorAll` + `children[2].textContent` |
| yandex: `script[type="application/ld+json"]` → `JSON.parse` | `textContent` + `JSON.parse` (с try/catch) |
| DDG: `a.result__a` → href → `URL.searchParams.get("uddg")` | то же, `decodeURIComponent` |

### 3.4 Контракт `answer` + `temperature: 1.0`

`generateAnswer` требует `{"answer": …}`. Все переносимые промпты дословны с бэкенда, но **примеры и схема ответа** обворачиваются в `{"answer": …}` + явное правило «ответ — только JSON с ключом `answer`», иначе small-модель при `temperature: 1.0` отдаст голый JSON и `generateAnswer` бросит ошибку. Фолбэк ошибок — тоже через `answer` (см. порции 2–4).

## 4. Порции (каждая проверяется отдельно)

### Порция 1 — каркас + источники названий (`names.ts`) ⏳
- Клиентские `getEanNames` (`service:814`), `getDisaiNames` (`service:833`), `getBarcodeNames` (`service:861`), `getYandexNames` (`service:882`) — дословно, cheerio → DOMParser (таблица 3.3).
- **CORS-проверка здесь же**: ожидаемо из браузера отдастся только `disai.org`; ean-online (preflight), barcode-list, yandex — TypeError. Решение по server action принимаем после твоей проверки в UI.
- Гибридное подключение: `ProductForm.tsx:160`, `ImportForm.tsx:86,166` переключаются на `generateProductData`; любой сбой шага → `console.log` + fallback на старый `generateProductAction` (бэкенд дорабатывает). UI работает всегда, видно, какой путь выполнен.
- Проверка: `npx tsc --noEmit`, ESLint, DevTools → какие источники отдались.

### Порция 2 — промпты имени + `clear_name` (`prompts.ts`, `names.ts`) ⏳
- `promptDetermineName` (`service:907-958`), `promptFormattedName` (`service:959-1002`) — дословно + обёртка `answer` (п. 3.4).
- Клиентский `findAndFormattedProductName` (`service:782-907`): 4 источника → fallback `formattedName(name, source_names)` если имя передано и пусто → бросок той же строки «По данному штрих-коду не удалось найти название товара…» → `determineName` → `{ source_names, clear_name, error }`.
- Проверка: имена определяются как на бэке.

### Порция 3 — поиск и валидация страниц (`pages.ts`) ⏳
- `getProductInfo` (`service:646-711`): DDG `fetch` → DOMParser (`a.result__a`, decode `uddg`, лимит 10) → `asyncPool(2, …)`.
- Замена Playwright — пробно (п. 3.2): fetch → текст → regex-чистки `service:496-520` → фото из HTML.
- Клиентский `validateParseProductInfo` (`service:712-760`): промпт дословно, ответ `{"answer": {data, error, photos}}`.
- Условие приёмки фильтра (`service:684-687`): `(data && !error) || (error && photos.length > 0)` — дословно.
- Если fetch даёт заметно меньше текста — Playwright/server action отдельной задачей.

### Порция 4 — `getProductOptions` → product ⏳
- Промпт дословно (`service:1061-1146`), пример ответа и вариант ошибки `{"error": "Ошибка: …"}` → `{"answer": …}`; фолбэк `{"answer": {"error": "…"}}`.
- Клиентские фильтры фото и сборка `formattedInfo` (`service:1029-1060`) — дословно (срезы `/\/\d{1,2}x\d{1,2}\//`, `yastatic`, `abt-challenge`, `favicon`, `replain.cc`, `404`, `imgtmb`, `countries_flags` …; обрезка текста источника до 5000 символов).

### Порция 5 — полный оркестратор, отключение fallback ⏳
- `index.ts` собирает всё: валидация barcode (`/^\d{8,14}$/`, сообщения как на бэке `service:374-381`) → имена → `clear_name` → страницы → `getProductOptions` → правила слияния ошибок (`service:416-455`).
- **Без сохранения записей** (см. «Отложено»): `create-product` в import-pdf продолжает работать через запись от бэкенда / fallback.
- Сравнение «новый путь vs бэкенд” на одном товаре → отключаем fallback.

## 5. Отложено (решения приняты 06.10.2026)

| Задача | Решение |
| --- | --- |
| Сохранение записей `product_source_record` на бэке | «Потом будем думать» — отдельного эндпоинта нет (запись создаётся только внутри `search`, `saveRecord` `service:1013`). Нужен мини-upsert `POST product-source-record/save`. ⏸ |
| `resolveCategory` внутри `create-product` (последний LLM-вызов бэкенда, `service:102`) | «Потом посмотрим» — категория уже подсвечивается клиентом в `FullInfoSuggestionModal`. ⏸ |
| Playwright / CORS-proxy как постоянное решение | только если клиентский вариант (fetch/DOMParser) не вытянет. ⏸ |
| Удаление `search`-пайплайна с бэкенда | не входит: бэкенд как референс не трогаем. ⏸ |

## 6. Точки подключения на клиенте

| Файл | Что |
| --- | --- |
| `src/app/product/components/ProductForm/ProductForm.tsx:160` | `handleGenerateFullInfo` → `generateProductAction(values.name, values.code)` |
| `src/app/product/import-from-pdf/components/ImportForm/ImportForm.tsx:86` | генерация одной позиции |
| `src/app/product/import-from-pdf/components/ImportForm/ImportForm.tsx:166` | массовая генерация пустых позиций |
| `src/app/product/action.ts:398` | текущий `generateProductAction` → `POST product-source-record` (остаётся как fallback до порции 5) |

После переноса LLM-вызовы бэкенда: `resolveCategory` в `create-product` (см. «Отложено»).

## 7. Верификация (каждая порция)

- shop-admin: `npx tsc --noEmit`, ESLint по изменённым файлам.
- Ручная проверка в UI (параллельно), сравнение с бэкендом на одном штрихкоде.
- `shop-back` не редактируется — проверки не требует.

## 8. Референс

**Полный дословный код бэкенда (контроллер, DTO, сущность, сервис целиком, зависимости) — в [backend-reference-product-source-record.md](./backend-reference-product-source-record.md). В `shop-back` ходить не нужно.**

Краткая карта бэкенд-кода (`shop-back/src/product-source-record/product-source-record.service.ts`, коммит `43d7f35`):

| Шаг | Метод | Строки |
| --- | --- | --- |
| Оркестратор | `search` | 368-455 |
| Источники имён | `getEanNames` / `getDisaiNames` / `getBarcodeNames` / `getYandexNames` | 814 / 833 / 861 / 882 |
| Сборка имён | `findAndFormattedProductName` | 782-907 |
| LLM-имя | `determineName` / `formattedName` | 907-958 / 959-1002 |
| Поиск страниц | `getProductInfo` (DDG + asyncPool) | 646-711 |
| Рендер страницы | `fetchWithPlaywright` | 458-527 |
| Валидация страницы | `validateParseProductInfo` | 712-781 |
| Финальный JSON | `getProductOptions` (+ фильтры фото) | 1029-1157 |
| Пул промисов | `asyncPool` | 529-543 |
| Запись в БД | `findRecord` / `saveRecord` | 1003-1011 / 1013-1027 |
| Создание товара | `createProductFromRecord` (+ `resolveCategory`) | 35-159 (LLM: 102) |
| Импорт | `checkImportItems` | 311-367 |
| Фото | `pickImages` (DDG images, `vqd`) | 545+ |

Эталонные промпты клиента (уже перенесены): `src/app/product/prompt.ts` (`promptSeoFromProduct`, `promptCategoryFromProduct`), контракт — `src/shared/llm/generateAnswer.ts`.
