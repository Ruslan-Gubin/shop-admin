import { declOfNum } from "@/shared/helpers/declOfNum";
import { priceFormatter } from "@/shared/helpers/formatPrice";
import { FormSection } from "@/widgets/form-section/FormSection";
import type { ProductModel } from "../../action";
import styles from "./ProductInfo.module.css";

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
  const firstPrice = props.pricesList.find((el) => el.value > 0);

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
          {typeof product.brand_name === "string" && product.brand_name.length > 0 && (
            <p className={styles.fieldValue}>
              <span className={styles.fieldLabel}>Бренд: {product.brand_name}</span>
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

      <FormSection title="Фото товара">
        {product.photos.length > 0 ? (
          <ul className={styles.photoList}>
            {product.photos.map((photo) => (
              <li key={photo.id} className={styles.photoItem}>
                <div className={styles.imageContainer}>
                  <picture>
                    <img
                      draggable={false}
                      className={styles.image}
                      src={photo.url}
                      alt={photo.url}
                    />
                  </picture>
                </div>
                <div className={styles.photoInfo}>
                  {product.name ? (
                    <p className={styles.cardName}>{product.name}</p>
                  ) : (
                    <div className={styles.skeletonName}>
                      <span className={styles.skeletonNameLine} />
                      <span
                        className={`${styles.skeletonNameLine} ${styles.skeletonNameLineShort}`}
                      />
                    </div>
                  )}
                  {firstPrice?.value ? (
                    <p className={styles.cardPrice}>{priceFormatter.format(firstPrice.value)}</p>
                  ) : (
                    <div className={styles.skeletonPrice} />
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.emptyText}>Фотографии не найдены</p>
        )}
      </FormSection>
      {/* <FormSection title="Фото товара"> */}
      {/*   {product.photos.length > 0 ? ( */}
      {/*     <div className={styles.productPhotoGrid}> */}
      {/*       {product.photos.map((photo) => ( */}
      {/*         <div key={photo.id} className={styles.photoItemGrid}> */}
      {/*           <picture> */}
      {/*             <img className={styles.image} src={photo.url} alt={product.name} /> */}
      {/*           </picture> */}
      {/*         </div> */}
      {/*       ))} */}
      {/*     </div> */}
      {/*   ) : ( */}
      {/*     <p className={styles.emptyText}>Фотографии не найдены</p> */}
      {/*   )} */}
      {/* </FormSection> */}

      <FormSection title="SEO">
        <div className={styles.mainContentContainer}>
          {product.seo_title && (
            <p className={styles.fieldValue}>
              <span className={styles.fieldLabel}>Заголовок страницы: </span>
              {product.seo_title}
            </p>
          )}
          {product.seo_description && (
            <p className={styles.fieldValue}>
              <span className={styles.fieldLabel}>SEO-описание: </span>
              {product.seo_description}
            </p>
          )}
          {product.keywords && (
            <p className={styles.fieldValue}>
              <span className={styles.fieldLabel}>Ключевые слова: </span>
              {product.keywords}
            </p>
          )}
          {product.og_title && (
            <p className={styles.fieldValue}>
              <span className={styles.fieldLabel}>OG-заголовок: </span>
              {product.og_title}
            </p>
          )}
          {product.og_description && (
            <p className={styles.fieldValue}>
              <span className={styles.fieldLabel}>OG-описание: </span>
              {product.og_description}
            </p>
          )}
          {product.og_type && (
            <p className={styles.fieldValue}>
              <span className={styles.fieldLabel}>OG-тип: </span>
              {product.og_type}
            </p>
          )}
          {product.slug && (
            <p className={styles.fieldValue}>
              <span className={styles.fieldLabel}>ЧПУ-адрес страницы: </span>
              {product.slug}
            </p>
          )}
        </div>
      </FormSection>
    </div>
  );
};
