import { declOfNum } from "@/shared/helpers/declOfNum";
import { priceFormatter } from "@/shared/helpers/formatPrice";
import { FormSection } from "@/widgets/form-section/FormSection";
import type { ProductModel } from "../../action";
import styles from "./ProductInfo.module.css";
import { argv0 } from "process";

type Props = {
  product: ProductModel;
  categoryName: string;
  pricesList: { id: number; label: string; value: number }[];
  stocksList: { id: number; label: string; value: string }[];
  specificationsList: { id: number; label: string; value: string }[];
  statisticsList: { id: number; label: string; value: string }[];
  questionsCount: number;
};

export const ProductInfo = (props: Props) => {
  const product = props.product;

  return (
    <div className={styles.root}>
      <FormSection title="Общие данные">
        <div className={styles.mainContentContainer}>
          {product.code && (
            <p className={styles.fieldValue}>
              <span className={styles.fieldLabel}>Штрих-код: </span>
              {product.code}
            </p>
          )}
          {product.name && (
            <p className={styles.fieldValue}>
              <span className={styles.fieldLabel}>Название: </span>
              {product.name}
            </p>
          )}
          {product.description && (
            <p className={styles.fieldValue}>
              <span className={styles.fieldLabel}>Описание: </span>
              {product.description}
            </p>
          )}
          {product.brand_id && (
            <p className={styles.fieldValue}>
              <span className={styles.fieldLabel}>Бренд: </span>
              {product.brand_id}
            </p>
          )}
          {props.categoryName && (
            <p className={styles.fieldValue}>
              <span className={styles.fieldLabel}>Категория: </span>
              {props.categoryName}
            </p>
          )}
          {product.country && (
            <p className={styles.fieldValue}>
              <span className={styles.fieldLabel}>Страна-производитель: </span>
              {product.country}
            </p>
          )}
          {product.product_type && (
            <p className={styles.fieldValue}>
              <span className={styles.fieldLabel}>Вид товара: </span>
              {product.product_type}
            </p>
          )}
          {product.equipment && (
            <p className={styles.fieldValue}>
              <span className={styles.fieldLabel}>Что входит в состав: </span>
              {product.equipment}
            </p>
          )}
        </div>
      </FormSection>

      <FormSection title="Характеристики">
        {props.specificationsList.length > 0 ? (
          <div className={styles.rowList}>
            {props.specificationsList.map((specification) => (
              <div key={specification.id} className={styles.row}>
                <span className={styles.fieldLabel}>{specification.label}</span>
                <span className={styles.fieldValue}>{specification.value}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.emptyText}>Характеристики не добавлены</p>
        )}
      </FormSection>

      {(product.weight > 0 || product.height > 0 || product.length > 0 || product.width > 0) && (
        <FormSection title="Габариты">
          <div className={styles.rowList}>
            {product.weight > 0 && (
              <div className={styles.row}>
                <span className={styles.fieldLabel}>Вес</span>
                <span className={styles.fieldValue}>{product.weight}</span>
              </div>
            )}
            {product.height > 0 && (
              <div className={styles.row}>
                <span className={styles.fieldLabel}>Высота</span>
                <span className={styles.fieldValue}>{product.height}</span>
              </div>
            )}
            {product.length > 0 && (
              <div className={styles.row}>
                <span className={styles.fieldLabel}>Длина</span>
                <span className={styles.fieldValue}>{product.length}</span>
              </div>
            )}
            {product.width > 0 && (
              <div className={styles.row}>
                <span className={styles.fieldLabel}>Ширина</span>
                <span className={styles.fieldValue}>{product.width}</span>
              </div>
            )}
          </div>
        </FormSection>
      )}

      <FormSection title="Цены">
        <div className={styles.rowList}>
          {product.purchase_price > 0 && (
            <div className={styles.row}>
              <span className={styles.fieldLabel}>Закупочная цена</span>
              <span className={styles.fieldValue}>
                {priceFormatter.format(product.purchase_price)}
              </span>
            </div>
          )}
          {props.pricesList.map((priceItem) => (
            <div key={priceItem.id} className={styles.row}>
              <span className={styles.fieldLabel}>{priceItem.label}</span>
              <span className={styles.fieldValue}>
                {typeof priceItem.value === "number" && priceItem.value > 0
                  ? priceFormatter.format(priceItem.value)
                  : "-/-"}
              </span>
            </div>
          ))}
        </div>
      </FormSection>

      <FormSection title="Остатки">
        {props.stocksList.length > 0 ? (
          <div className={styles.rowList}>
            {props.stocksList.map((stock) => (
              <div key={stock.id} className={styles.row}>
                <span className={styles.fieldLabel}>{stock.label}</span>
                <span className={styles.fieldValue}>{stock.value}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.emptyText}>Нет остатков на складах</p>
        )}
      </FormSection>

      <FormSection title="Отзывы и вопросы">
        <div className={styles.rowList}>
          <div className={styles.row}>
            <span className={styles.fieldLabel}>Общая оценка</span>
            <span className={styles.fieldValue}>★ {product.rating}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.fieldLabel}>
              {declOfNum(product.review_count, ["Отзыв", "Отзыва", "Отзывов"])}
            </span>
            <span className={styles.fieldValue}>{product.review_count}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.fieldLabel}>
              {declOfNum(props.questionsCount, ["Вопрос", "Вопроса", "Вопросов"])}
            </span>
            <span className={styles.fieldValue}>{props.questionsCount}</span>
          </div>
        </div>
      </FormSection>

      {props.statisticsList.length > 0 && (
        <FormSection title="Статистика">
          <div className={styles.rowList}>
            {props.statisticsList.map((statistic) => (
              <li key={statistic.id} className={styles.row}>
                <span className={styles.rowLabel}>{statistic.label}</span>
                <span className={styles.rowValue}>{statistic.value}</span>
              </li>
            ))}
          </div>
        </FormSection>
      )}

      {/* Фото товара (пустой блок) */}
      <FormSection title="Фото товара">
        <p className={styles.emptyText}>Модуль фотографий не реализован</p>
      </FormSection>

      {/* SEO (планируется) */}
      <FormSection title="SEO (планируется)">
        <p className={styles.emptyText}>
          В разработке: meta-заголовок, meta-описание, ЧПУ (slug), Open Graph, настройка
          индексирования.
        </p>
      </FormSection>
    </div>
  );
};
