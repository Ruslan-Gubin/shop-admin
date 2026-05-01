# Структура базы данных

## Таблицы

### price_types — Справочник типов цен

| Поле         | Тип          | Описание            |
| ------------ | ------------ | ------------------- |
| id           | UUID         | PK                  |
| name         | VARCHAR(100) | Уникальное название |
| description  | TEXT         | Описание            |
| is_active    | BOOLEAN      | Активен             |
| min_quantity | INT          | Минимальное кол-во  |
| created_at   | TIMESTAMP    | Дата создания       |
| updated_at   | TIMESTAMP    | Дата обновления     |

### products — Товары

| Поле           | Тип           | Описание        |
| -------------- | ------------- | --------------- |
| id             | UUID          | PK              |
| name           | VARCHAR(255)  | Название        |
| purchase_price | DECIMAL(12,2) | Закупочная цена |
| created_at     | TIMESTAMP     | Дата создания   |
| updated_at     | TIMESTAMP     | Дата обновления |

### product_prices — Цены товаров

| Поле          | Тип           | Описание                          |
| ------------- | ------------- | --------------------------------- |
| id            | UUID          | PK                                |
| product_id    | UUID          | FK → products                     |
| price_type_id | UUID          | FK → price_types                  |
| price         | DECIMAL(12,2) | Цена                              |
|               |               | UNIQUE(product_id, price_type_id) |

### price_calculation_rules — Правила автозаполнения

| Поле               | Тип           | Описание         |
| ------------------ | ------------- | ---------------- |
| id                 | UUID          | PK               |
| price_type_id      | UUID          | FK → price_types |
| min_purchase_price | DECIMAL(12,2) | Диапазон от      |
| max_purchase_price | DECIMAL(12,2) | Диапазон до      |
| margin_percent     | INT           | Наценка %        |
| created_at         | TIMESTAMP     | Дата создания    |

### clients — Клиенты

| Поле       | Тип          | Описание                      |
| ---------- | ------------ | ----------------------------- |
| id         | UUID         | PK                            |
| name       | VARCHAR(255) | Имя                           |
| type       | VARCHAR(20)  | retail / wholesale / employee |
| created_at | TIMESTAMP    | Дата создания                 |

### cart_discounts — Скидки на корзину

| Поле             | Тип           | Описание                 |
| ---------------- | ------------- | ------------------------ |
| id               | UUID          | PK                       |
| name             | VARCHAR(100)  | Название                 |
| min_sum          | DECIMAL(12,2) | Порог суммы              |
| discount_percent | INT           | Процент скидки           |
| apply_to         | VARCHAR(20)   | all / retail / wholesale |
| is_active        | BOOLEAN       | Активна                  |
| created_at       | TIMESTAMP     | Дата создания            |
| updated_at       | TIMESTAMP     | Дата обновления          |

### promotions — Акции

| Поле             | Тип          | Описание                 |
| ---------------- | ------------ | ------------------------ |
| id               | UUID         | PK                       |
| name             | VARCHAR(100) | Название                 |
| discount_percent | INT          | Процент скидки           |
| valid_from       | TIMESTAMP    | Начало                   |
| valid_to         | TIMESTAMP    | Конец                    |
| apply_to         | VARCHAR(20)  | all / retail / wholesale |
| is_active        | BOOLEAN      | Активна                  |
| created_at       | TIMESTAMP    | Дата создания            |
| updated_at       | TIMESTAMP    | Дата обновления          |

## Связи

```
products ← product_prices → price_types
products ← price_calculation_rules → price_types //  под вопросом
cart_discounts (нет связей)
promotions (нет связей)
clients (нет связей)
```

