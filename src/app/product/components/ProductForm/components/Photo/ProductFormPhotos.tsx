import { type DragEvent, useLayoutEffect, useState } from "react";
import { getParsePhotoAction, type PhotoItem } from "@/app/product/action";
import { priceFormatter } from "@/shared/helpers/formatPrice";
import { Button } from "@/shared/ui/button-main/Button";
import { Checkbox } from "@/shared/ui/checkbox/Checkbox";
import { Input } from "@/shared/ui/input-main/Input";
import { notificationAdapter } from "@/stores/notification/adapter";
import { ProductPhotoPreviewModal } from "@/views/product-photo-preview/ProductPhotoPreviewModal";
import { FormInstruction } from "@/widgets/form-instruction/FormInstruction";
import { FormSection } from "@/widgets/form-section/FormSection";
import { ModalDelete } from "@/widgets/modals/modal-delete/ModalDelete";
import styles from "./ProductFormPhotos.module.css";

type Props = {
  photos: PhotoItem[];
  setPhotos: (photos: PhotoItem[]) => void;
  name: string;
  price: number | null;
  description: string;
  brand_name: string;
  specifications: { label: string; value: string }[];
};

export const ProductFormPhotos = (props: Props) => {
  const [selected, setSelected] = useState<number[]>([]);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [urlPhoto, setUrlPhoto] = useState<string>("");
  const [previewPhotoId, setPreviewPhotoId] = useState<number | null>(null);
  const [variantModal, setVariantModal] = useState<"delete" | "add">("delete");
  const [recommendedPhotos, setRecommendedPhotos] = useState<PhotoItem[] | null>(null);
  const [isLoadingRecommended, setIsLoadingRecommended] = useState(false);

  useLayoutEffect(() => {
    if (typeof props.name === "string" && recommendedPhotos) {
      setRecommendedPhotos(null);
    }
  }, [props.name]);

  const handleOpenPreview = (id: number) => {
    setPreviewPhotoId(id);
  };

  const handleSelectPhoto = (id: number) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((el) => el !== id) : [...prev, id]));
  };

  const checkPhotoPosition = (photos: PhotoItem[]) => {
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      if (photo.position !== i + 1) {
        photos[i].position = i + 1;
      }
    }
    return photos;
  };

  const handleDelete = () => {
    const updatePhotos = checkPhotoPosition(
      props.photos.filter((photo) => !selected.includes(photo.id)),
    );
    props.setPhotos(updatePhotos);
    setSelected([]);
    setDeleteOpen(false);
  };

  const handleDeletePhoto = (id: number) => {
    if (selected.includes(id)) {
      setSelected((prev) => prev.filter((el) => el !== id));
    }

    props.setPhotos(checkPhotoPosition(props.photos.filter((photo) => photo.id !== id)));
  };

  const handleDragStart = (id: number) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: DragEvent<HTMLLIElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent<HTMLLIElement>, targetId: number) => {
    e.preventDefault();

    if (draggedId !== targetId) {
      const draggedPosition = props.photos.find((el) => el.id === draggedId)?.position;
      const targetPosition = props.photos.find((el) => el.id === targetId)?.position;

      if (draggedPosition && targetPosition) {
        props.setPhotos(
          props.photos.map((photo) =>
            photo.position === draggedPosition
              ? { ...photo, position: targetPosition }
              : photo.position === targetPosition
                ? { ...photo, position: draggedPosition }
                : photo,
          ),
        );
      }
    }

    setDraggedId(null);
  };

  const handleAddUrlPhoto = () => {
    const newPhotoItem: PhotoItem = {
      created_at: "",
      id: Date.now(),
      parent_id: 0,
      parent_type: "product",
      position: props.photos.length + 1,
      updated_at: "",
      url: urlPhoto,
    };

    props.setPhotos(checkPhotoPosition([...props.photos, newPhotoItem]));
    setUrlPhoto("");
  };

  const handleGetRecommendedPhotos = () => {
    setIsLoadingRecommended(true);

    getParsePhotoAction(props.name)
      .then((response) => {
        if (response.status === "success" && response.data) {
          const recommendedPhotos = [];

          for (let i = 0; i < response.data.length; i++) {
            const url = response.data[i];

            if (!props.photos.some((el) => el.url === url)) {
              recommendedPhotos.push({
                created_at: "",
                id: Date.now() + i,
                parent_id: 0,
                parent_type: "product",
                position: 0,
                updated_at: "",
                url,
              });
            }
          }

          setRecommendedPhotos(recommendedPhotos);
        } else {
          notificationAdapter.add(
            typeof response.message === "string" ? response.message : "Не удалось получить фото",
            response.status,
          );
        }
      })
      .finally(() => {
        setIsLoadingRecommended(false);
      });
  };

  const handleRecommendedButtonClick = () => {
    if (recommendedPhotos && recommendedPhotos.length > 0) {
      setVariantModal("add");
      setPreviewPhotoId(recommendedPhotos[0].id);
    } else {
      handleGetRecommendedPhotos();
    }
  };

  const handleAddRecommendedPhoto = (photo: PhotoItem) => {
    photo.position = props.photos.length + 1;
    props.setPhotos(checkPhotoPosition([...props.photos, photo]));
  };

  const handleOpenListItemPhoto = (id: number) => {
    if (id) {
      handleOpenPreview(id);
      setVariantModal("delete");
    }
  };

  const handleOpenRecommendedListItemPhoto = (id: number) => {
    if (id) {
      handleOpenPreview(id);
      setVariantModal("add");
    }
  };

  return (
    <>
      <ProductPhotoPreviewModal
        key={previewPhotoId}
        initialPhotoId={previewPhotoId}
        photos={props.photos}
        recommendedPhotos={recommendedPhotos ?? []}
        name={props.name}
        price={props.price}
        onClose={() => setPreviewPhotoId(null)}
        description={props.description}
        brand_name={props.brand_name}
        specifications={props.specifications}
        variant={variantModal}
        onDeletePhoto={handleDeletePhoto}
        onAddPhoto={handleAddRecommendedPhoto}
      />
      <ModalDelete
        submit={handleDelete}
        title="Вы действительно хотите удалить выбранные фото для товара?"
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        disabled={false}
        showSubTitle={true}
      />

      <FormSection title="Фото товара">
        <FormInstruction>
          <span>PNG или JPEG с размером до 15 мб..</span>
        </FormInstruction>
        <div className={styles.addUrlContainer}>
          <Input
            value={urlPhoto}
            onChange={(e) => setUrlPhoto(e.target.value)}
            variantSize="sm"
            variant="outlined"
            placeholder="Добавить ссылку на изображение"
            label="Добавить ссылку на изображение"
          />
          <Button
            variant="solid"
            onClick={handleAddUrlPhoto}
            disabled={!(urlPhoto.length > 0 && urlPhoto.startsWith("https"))}
            variantColor="green"
            size="sm"
          >
            Добавить ссылку
          </Button>
        </div>
        {recommendedPhotos && recommendedPhotos.length > 0 && (
          <ul className={styles.recommendedPhotosList}>
            {recommendedPhotos.map((photo) => (
              <li key={photo.id} className={styles.recommendedPhotoItem}>
                <div className={styles.imageContainer}>
                  <picture
                    onClick={() => handleOpenRecommendedListItemPhoto(photo.id)}
                    className={styles.imagePicture}
                  >
                    <img
                      draggable={false}
                      className={styles.image}
                      src={photo.url}
                      alt={photo.url}
                    />
                  </picture>
                </div>
                <div className={styles.photoInfo}>
                  {props.name ? (
                    <p className={styles.cardName}>{props.name}</p>
                  ) : (
                    <div className={styles.skeletonName}>
                      <span className={styles.skeletonNameLine} />
                      <span
                        className={`${styles.skeletonNameLine} ${styles.skeletonNameLineShort}`}
                      />
                    </div>
                  )}
                  {props.photos.some((el) => el.id === photo.id && el.url === photo.url) ? (
                    <Button
                      onClick={() => handleDeletePhoto(photo.id)}
                      size="xs"
                      variantColor="error"
                      fullWidth
                    >
                      Удалить
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleAddRecommendedPhoto(photo)}
                      size="xs"
                      variantColor="green"
                      fullWidth
                    >
                      Добавить
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        <Button
          variant="solid"
          variantColor={recommendedPhotos !== null ? "green" : "blue"}
          size="sm"
          onClick={handleRecommendedButtonClick}
          disabled={
            isLoadingRecommended ||
            (recommendedPhotos !== null && recommendedPhotos.length === 0) ||
            !props.name
          }
          customClass={`${styles.deleteButton} ${
            recommendedPhotos && recommendedPhotos.length > 0 ? styles.successButton : ""
          }`}
        >
          {isLoadingRecommended ? (
            <>
              <span className="spinner" />
              Поиск…
            </>
          ) : recommendedPhotos === null ? (
            "Подобрать фото"
          ) : recommendedPhotos.length > 0 ? (
            `${recommendedPhotos.length} подходящих изображений`
          ) : (
            "Не найдено"
          )}
        </Button>
        <ul className={styles.photoList}>
          {props.photos.map((photo) => (
            <li
              key={photo.id}
              className={styles.photoItem}
              draggable={true}
              onDragStart={() => handleDragStart(photo.id)}
              onDragOver={(e) => handleDragOver(e)}
              onDrop={(e) => handleDrop(e, photo.id)}
            >
              <div className={styles.imageContainer}>
                <div className={styles.checkboxContainer}>
                  <Checkbox
                    onChange={() => handleSelectPhoto(photo.id)}
                    checked={selected.includes(photo.id)}
                  />
                </div>
                <picture
                  onClick={() => handleOpenListItemPhoto(photo.id)}
                  className={styles.imagePicture}
                >
                  <img draggable={false} className={styles.image} src={photo.url} alt={photo.url} />
                </picture>
              </div>
              <div className={styles.photoInfo} onClick={() => handleOpenListItemPhoto(photo.id)}>
                {props.name ? (
                  <p className={styles.cardName}>{props.name}</p>
                ) : (
                  <div className={styles.skeletonName}>
                    <span className={styles.skeletonNameLine} />
                    <span
                      className={`${styles.skeletonNameLine} ${styles.skeletonNameLineShort}`}
                    />
                  </div>
                )}
                {props.price ? (
                  <p className={styles.cardPrice}>{priceFormatter.format(props.price)}</p>
                ) : (
                  <div className={styles.skeletonPrice} />
                )}
              </div>
            </li>
          ))}
        </ul>

        {props.photos.length > 0 && (
          <Button
            disabled={selected.length === 0}
            variantColor="error"
            size="sm"
            variant="solid"
            onClick={() => setDeleteOpen(true)}
          >
            Удалить выбранное
          </Button>
        )}
      </FormSection>
    </>
  );
};
