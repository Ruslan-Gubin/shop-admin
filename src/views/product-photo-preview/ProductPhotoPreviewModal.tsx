import { useState } from "react";
import type { PhotoItem } from "@/app/product/action";
import { priceFormatter } from "@/shared/helpers/formatPrice";
import { ArrowRightSvg } from "@/shared/svg/ArrowRightSvg";
import { CloseSvg } from "@/shared/svg/CloseSvg";
import { Button } from "@/shared/ui/button-main/Button";
import { Modal } from "@/shared/ui/modal/Modal";
import styles from "./ProductPhotoPreviewModal.module.css";

type Props = {
  photos: PhotoItem[];
  recommendedPhotos: PhotoItem[];
  name: string;
  price: number | null;
  initialPhotoId: number | null;
  onClose: () => void;
  description?: string;
  specifications: { label: string; value: string }[];
  brand_name: string;
  variant: "delete" | "add";
  onDeletePhoto: (photoId: number) => void;
  onAddPhoto: (photo: PhotoItem) => void;
};

export const ProductPhotoPreviewModal = (props: Props) => {
  const photosList =
    props.variant === "add" ? (props.recommendedPhotos ?? []) : (props.photos ?? []);
  const initialIndex = Math.max(
    0,
    photosList.findIndex((photo) => photo.id === props.initialPhotoId),
  );
  const [selectImage, setSelectImage] = useState<number>(initialIndex);

  const handleChangePhoto = (direction: "prev" | "next") => {
    if (photosList.length > 0) {
      let updateSelectImage = direction === "prev" ? selectImage - 1 : selectImage + 1;

      if (updateSelectImage < 0) {
        updateSelectImage = photosList.length - 1;
      } else if (updateSelectImage > photosList.length - 1) {
        updateSelectImage = 0;
      }

      setSelectImage(updateSelectImage);
    }
  };

  const currentPhoto = photosList[selectImage] ?? photosList[photosList.length - 1];

  const handleDeletePhoto = () => {
    if (currentPhoto) {
      if (photosList.length === 1) {
        props.onDeletePhoto(currentPhoto.id);
        props.onClose();
      } else {
        const isLast = selectImage === photosList.length - 1;
        props.onDeletePhoto(currentPhoto.id);
        setSelectImage(isLast ? selectImage - 1 : selectImage);
      }
    }
  };

  const handleAddPhoto = () => {
    if (currentPhoto) {
      props.onAddPhoto?.(currentPhoto);
    }
  };

  return (
    <Modal
      active={props.initialPhotoId !== null}
      handleCloseAction={props.onClose}
      classContainer={styles.modalContent}
    >
      <section className={styles.imageSide}>
        {photosList.length > 1 && (
          <button
            type="button"
            className={`${styles.arrowButton} ${styles.arrowLeftButton}`}
            onClick={() => handleChangePhoto("prev")}
          >
            <ArrowRightSvg />
          </button>
        )}
        <picture className={styles.imagePicture}>
          {currentPhoto && <img className={styles.image} src={currentPhoto.url} alt={props.name} />}
        </picture>
        {photosList.length > 1 && (
          <button
            type="button"
            className={styles.arrowButton}
            onClick={() => handleChangePhoto("next")}
          >
            <ArrowRightSvg />
          </button>
        )}
        <div className={styles.countContainer}>
          {selectImage + 1}/{photosList.length}
        </div>
      </section>

      <section className={styles.infoSide}>
        <header className={styles.infoHeaderLine}>
          <div className={styles.titleContainer}>
            {props.brand_name && <span className={styles.brandLink}>{props.brand_name}</span>}
            <h3 className={styles.title}>{props.name || "Название товара"}</h3>
            {props.price ? (
              <p className={styles.price}>{priceFormatter.format(props.price)}</p>
            ) : null}
          </div>
          <div className={styles.infoHeaderActions}>
            <button type="button" onClick={props.onClose} className={styles.closeButtonSvg}>
              <CloseSvg />
            </button>
          </div>
        </header>

        <div className={styles.blockInfo}>
          <div className={styles.blockInfoContent}>
            {props.description && (
              <div className={styles.infoBlock}>
                <span className={styles.infoLabel}>Описание</span>
                <p className={styles.description}>{props.description}</p>
              </div>
            )}

            {props.specifications.length > 0 && (
              <div className={styles.infoBlock}>
                <span className={styles.infoLabel}>Характеристики</span>
                <ul className={styles.optionsList}>
                  {props.specifications.map((item) => (
                    <li key={item.label} className={styles.optionsItem}>
                      <div className={styles.optionsLabelContainer}>
                        <span className={styles.optionsLabel}>{item.label}</span>
                        <div className={styles.dottedLine} />
                      </div>
                      <div className={styles.optionsValueContainer}>
                        <span className={styles.optionsValue}>{item.value}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <footer className={styles.actions}>
            {props.variant === "delete" && (
              <Button
                variant="solid"
                variantColor="error"
                size="sm"
                customClass={styles.actionButton}
                onClick={handleDeletePhoto}
              >
                Удалить
              </Button>
            )}

            {props.variant === "add" && (
              <Button
                variant="solid"
                variantColor="green"
                size="sm"
                customClass={styles.actionButton}
                onClick={handleAddPhoto}
                disabled={!currentPhoto || props.photos.some((el) => el.url === currentPhoto.url)}
              >
                Добавить
              </Button>
            )}
          </footer>
        </div>
      </section>
    </Modal>
  );
};
