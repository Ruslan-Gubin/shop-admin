# Архитектура синхронизации мобильной таблицы через cookies

## Обзор

Документация описывает архитектурный паттерн для синхронизации локального состояния мобильной таблицы с серверными данными после операций редактирования и удаления. Решение использует cookies как канал связи между серверными действиями (Server Actions) и клиентским состоянием React.

**Преимущества подхода:**
- Локальное состояние остается внутри мобильной таблицы (оптимизация)
- Не требует поднятия состояния вверх по дереву компонентов
- Решение переиспользуемое для любых мобильных таблиц
- После `revalidatePath` клиент получает актуальные данные текущей страницы, а cookies позволяют обновить элементы с других страниц

---

## Полный путь данных

### 1. Уровень страницы (Server Component)

**Файл:** `src/app/price-types/page.tsx`

```typescript
export default async function PriceTypesPage(req: {
  searchParams: Promise<{ page: string; name: string }>;
}) {
  const searchParams = await req.searchParams;
  const tableData = await fetchPriceTypes(searchParams.name, "10", searchParams.page);
  
  // ...
  
  return (
    <PriceTypesTableWrapper
      data={tableData?.data?.priceTypes || []}
      onDeleteItemAction={deletePriceTypeAction}
      updatePriceTypeAction={updatePriceTypeAction}
      fetchTableElementAction={fetchPriceType}
      // ...
    />
  );
}
```

**Ответственность:**
- Получение начальных данных через `fetchPriceTypes`
- Передача серверных экшенов в обертку таблицы
- Управление пагинацией через searchParams

---

### 2. Уровень обертки таблицы (Client Component)

**Файл:** `src/app/price-types/components/PriceTypesTableWrapper/PriceTypesTableWrapper.tsx`

```typescript
export const PriceTypesTableWrapper = (props: Props) => {
  const [submitLoading, transition] = useTransition();
  const [optionFormModal, setOptionFormModal] = useState({...});

  const submitDelete = () => {
    if (optionFormModal.isDelete && optionFormModal.isOpen) {
      transition(() => {
        if (optionFormModal.id) {
          props.onDeleteItemAction(optionFormModal.id).then((res) => {
            notificationAdapter.add(res.message, res.status);
            if (res.status === "success") {
              props.redirectPageAfterDeleteAction(); // Вызывает revalidatePath
            }
            handleCloseFormModal();
          });
        }
      });
    }
  };

  return (
    <>
      {/* Модалки редактирования и удаления */}
      {isMounted && isMobile && (
        <MainMobileTable
          data={props.data}
          fetchTableElementAction={props.fetchTableElementAction}
          // ...
        />
      )}
    </>
  );
};
```

**Ответственность:**
- Управление состоянием модальных окон
- Вызов серверных экшенов для удаления/редактирования
- Передача пропсов в мобильную таблицу

---

### 3. Серверные действия (Server Actions)

**Файл:** `src/app/price-types/action.ts`

#### Удаление элемента

```typescript
export const deletePriceTypeAction = async (id: number): Promise<{ status: "error" | "success"; message: string }> => {
  return fetchService.delete<null>({ url: `price-type/${id}` })
    .then(async (response) => {
      if (response.status === "success") {
        // Устанавливаем cookie для клиента
        const cookieStore = await cookies();
        cookieStore.set("delete", String(id), { httpOnly: false, path: "/" });
        
        revalidatePath("/price-types");
      }
      return { status: response.status, message: response.message };
    });
};
```

#### Редактирование элемента

```typescript
export const updatePriceTypeAction = async (prevState, formData): Promise<CreatePriceTypeFormFields> => {
  // Валидация и подготовка payload
  
  await fetchService.patch<null>({ url: `price-type/${id}`, payload: validate.payload })
    .then(async (response) => {
      if (response.status === "success") {
        // Устанавливаем cookie с ID обновленного элемента
        const cookieStore = await cookies();
        cookieStore.set("update", String(id), { httpOnly: false, path: "/" });
        
        revalidatePath("/price-types");
      }
    });
  
  return validate.newState;
};
```

**Ключевые моменты:**
- `httpOnly: false` — обязательно, чтобы cookie был доступен через JavaScript на клиенте
- `path: "/"` — cookie доступен на всем сайте
- Установка cookie происходит **до** `revalidatePath`, чтобы клиент получил cookie при следующем рендере

---

### 4. Мобильная таблица (Client Component с локальным состоянием)

**Файл:** `src/widgets/main-mobile-table/MainMobileTable.tsx`

#### Локальное состояние и накопление данных

```typescript
export const MainMobileTable = <T extends { id: number }>(props: Props<T>) => {
  const [data, setData] = useState<T[]>([]); // Накопленные данные всех страниц
  const [pages, setPages] = useState<number[]>([]); // История загруженных страниц
  const currentPage: number = Number(props.searchParams.page || "1");

  // Накопление данных при скролле (infinite scroll)
  const getUpdateDataEvent = useEffectEvent((currentPage: number) => {
    const updatePages = pages;
    const updateData: T[] = [];

    updatePages.push(currentPage);
    const isValidPage = getIsValidCurrentPage(updatePages, currentPage);

    if (!isValidPage) {
      updatePages.length = 0;
      if (currentPage === 1) {
        updatePages.push(1);
        updateData.push(...props.data);
      }
      router.push(getUpdateQueryPageString(props.patch, props.searchParams, 1));
    } else {
      if (currentPage > 0 && data.length > 0) {
        updateData.push(...data);
      }
      updateData.push(...props.data);
    }

    setPages(updatePages);
    setData(updateData);
  });

  useLayoutEffect(() => {
    getUpdateDataEvent(currentPage);
  }, [currentPage]);
```

#### Синхронизация через cookies (ключевая часть)

```typescript
  const updateAfterActionDataEvent = useEffectEvent(() => {
    if (typeof window !== "undefined") {
      // Хелперы для работы с cookies
      const getCookie = (name: string): string | undefined => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(";").shift();
      };

      const deleteCookie = (key: string) => {
        document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      };

      // Проверяем cookie для удаления
      const deleteId = getCookie("delete");
      if (deleteId) {
        setData((prev) => prev.filter((el) => el.id !== Number(deleteId)));
        deleteCookie("delete");
      }

      // Проверяем cookie для обновления
      const updateId = getCookie("update");
      if (updateId) {
        // Запрашиваем актуальные данные элемента с сервера
        props.fetchTableElementAction(updateId).then((response) => {
          if (response.status === "success" && response.data) {
            setData((prev) =>
              prev.map((el) => (el.id === Number(updateId) && response.data ? response.data : el))
            );
            deleteCookie("update");
          }
        });
      }
    }
  });

  // Запускаем синхронизацию при обновлении props.data (после revalidatePath)
  useLayoutEffect(() => {
    updateAfterActionDataEvent();
  }, [props.data]);
```

---

## Пошаговый сценарий: Редактирование элемента на 1-й странице, когда загружено 5 страниц

1. **Пользователь нажимает "Редактировать"** на элементе с ID=5 (1-я страница)
2. **Открывается модальное окно** `ModalPriceTypeForm`
3. **Пользователь вносит изменения и нажимает "Сохранить"**
4. **Вызывается `updatePriceTypeAction`** (Server Action):
   - Отправляется PATCH запрос на сервер
   - При успехе: `cookieStore.set("update", "5")` (сохраняем ID в cookie)
   - Вызывается `revalidatePath("/price-types")`
5. **Next.js повторно рендерит страницу**:
   - `page.tsx` вызывает `fetchPriceTypes` с текущими searchParams (page=5, так как пользователь прокрутил до 5-й страницы)
   - Возвращаются данные 5-й страницы
6. **Клиентский компонент обновляется**:
   - `props.data` обновляется (данные 5-й страницы)
   - Срабатывает `useLayoutEffect` в `MainMobileTable` для `updateAfterActionDataEvent`
7. **`updateAfterActionDataEvent` выполняет**:
   - Читает cookie "update" → получает ID=5
   - Вызывает `fetchTableElementAction("5")` для получения актуальных данных элемента
   - Обновляет локальный стейт: `setData(prev => prev.map(el => el.id === 5 ? updatedItem : el))`
   - Удаляет cookie "update"
8. **Пользователь видит обновленные данные** элемента на 1-й странице, хотя сейчас отображается 5-я

---

## Пошаговый сценарий: Удаление элемента

1. **Пользователь нажимает "Удалить"** на элементе с ID=10
2. **Открывается модальное окно подтверждения** `ModalDelete`
3. **Пользователь подтверждает удаление**
4. **Вызывается `deletePriceTypeAction`**:
   - Отправляется DELETE запрос
   - При успехе: `cookieStore.set("delete", "10")`
   - Вызывается `revalidatePath("/price-types")`
5. **Страница ререндерится**, `props.data` обновляется
6. **`updateAfterActionDataEvent`**:
   - Читает cookie "delete" → ID=10
   - Фильтрует локальный стейт: `setData(prev => prev.filter(el => el.id !== 10))`
   - Удаляет cookie "delete"
7. **Элемент исчезает из списка** мгновенно

---

## Требования к переиспользованию

Для использования этого паттерна в других мобильных таблицах необходимо:

### 1. В серверных экшенах (action.ts):
```typescript
// Для удаления
const cookieStore = await cookies();
cookieStore.set("delete", String(id), { httpOnly: false, path: "/" });

// Для редактирования
const cookieStore = await cookies();
cookieStore.set("update", String(id), { httpOnly: false, path: "/" });
```

### 2. В мобильной таблице (MainMobileTable):
- Проп `fetchTableElementAction` — функция для получения одного элемента по ID
- Локальный стейт `data` для накопления данных
- Эффект для чтения cookies и обновления локального стейта

### 3. Хелперы для работы с cookies (уже включены в MainMobileTable):
```typescript
const getCookie = (name: string): string | undefined => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
};

const deleteCookie = (key: string) => {
  document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};
```

---

## Ограничения и нюансы

1. **Cookielimit**: Размер cookie ограничен (~4KB). Для передачи ID это не проблема.
2. **httpOnly: false**: Обязательно для доступности через JavaScript.
3. **Timing**: Cookie должен устанавливаться до `revalidatePath`, иначе клиент может не получить его при первом рендере.
4. **Множественные действия**: Если пользователь быстро удалит несколько элементов, последняя cookie перезапишет предыдущую. Для продакшена можно рассмотреть массив ID в cookie.
5. **Очистка**: Cookie удаляется сразу после использования, чтобы избежать повторной обработки при следующем рендере.

---

## Схема взаимодействия

```
[Клиент: Модалка]
    ↓
[Server Action: updatePriceTypeAction]
    ↓
[Установка cookie "update" + revalidatePath]
    ↓
[Next.js: Ререндер страницы + передача props.data]
    ↓
[Клиент: MainMobileTable получает новые props.data]
    ↓
[useEffect: Чтение cookie "update"]
    ↓
[fetchTableElementAction: Получение актуальных данных]
    ↓
[Обновление локального стейта data]
    ↓
[Удаление cookie "update"]
```
