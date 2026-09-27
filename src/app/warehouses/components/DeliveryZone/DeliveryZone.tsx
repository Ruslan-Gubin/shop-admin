import { type CSSProperties, type Dispatch, type SetStateAction, useState } from "react";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import "mapbox-gl/dist/mapbox-gl.css";
import { Map as MapMain, Marker } from "react-map-gl/mapbox";
import { AddSvg } from "@/app/category/components/category-item/svg/AddSvg";
import { DeleteSvg } from "@/app/category/components/category-item/svg/DeleteSvg";
import { EditSvg } from "@/app/category/components/category-item/svg/EditSvg";
import { priceFormatter } from "@/shared/helpers/formatPrice";
import { Button } from "@/shared/ui/button-main/Button";
import { Input } from "@/shared/ui/input-main/Input";
import { CustomMarker } from "@/shared/ui/mapbox/map-marker/CustomMarker";
import { Modal } from "@/shared/ui/modal/Modal";
import { ModalBody } from "@/shared/ui/modal/modal-body/ModalBody";
import { ModalContent } from "@/shared/ui/modal/modal-content/ModalContent";
import { ModalFooter } from "@/shared/ui/modal/modal-footer/ModalFooter";
import { ModalHeader } from "@/shared/ui/modal/modal-header/ModalHeader";
import { FormSection } from "@/widgets/form-section/FormSection";
import { ModalDelete } from "@/widgets/modals/modal-delete/ModalDelete";
import { DeliveryZonesMap } from "../DeliveryZonesMap/DeliveryZonesMap";
import { DrawControl, type DrawEventFeature } from "../DrawControl/DrawControl";
import styles from "./DeliveryZone.module.css";

const ZONE_COLORS = [
  { value: "#29ae29", label: "Зелёный" },
  { value: "#e48525", label: "Оранжевый" },
  { value: "#f1117e", label: "Розовый" },
  { value: "#ae2929", label: "Красный" },
  { value: "#aeae29", label: "Горчичный" },
  { value: "#85e425", label: "Лаймовый" },
  { value: "#25e485", label: "Мятный" },
  { value: "#29aeae", label: "Бирюзовый" },
  { value: "#2585e4", label: "Голубой" },
  { value: "#2929ae", label: "Синий" },
  { value: "#8525e4", label: "Фиолетовый" },
  { value: "#ae29ae", label: "Пурпурный" },
];

export interface Sector extends DrawEventFeature {
  color: string;
  price: number;
}

type Props = {
  initCenter: { lat: number; lng: number };
  mapToken: string;
  mapStyle: string;
  sectors: Sector[];
  setSectors: Dispatch<SetStateAction<Sector[]>>;
};

export const DeliveryZone = (props: Props) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [color, setColor] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [draftPolygon, setDraftPolygon] = useState<DrawEventFeature[]>([]);
  const [editSector, setEditSector] = useState<Sector | null>(null);
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  const [deleteSectorId, setDeleteSectorId] = useState<string | null>(null);

  const resetDraft = () => {
    setDraftPolygon([]);
    setColor("");
    setPrice("");
    setEditSector(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetDraft();
  };

  const priceNumber = Number(price);

  const isPriceValid =
    !Number.isNaN(priceNumber) && Number.isFinite(priceNumber) && priceNumber >= 0;

  const isValidPolygon =
    draftPolygon.length > 0 &&
    draftPolygon[0].id &&
    draftPolygon[0]?.geometry?.coordinates?.length > 0;

  const handleAddSector = () => {
    if (isValidPolygon && isPriceValid) {
      if (editSector) {
        const updateSectors = [];

        for (let i = 0; i < props.sectors.length; i++) {
          if (props.sectors[i].id === editSector.id) {
            updateSectors.push({
              ...draftPolygon[0],
              color,
              price: priceNumber,
            });
          } else {
            updateSectors.push(props.sectors[i]);
          }
        }

        props.setSectors(updateSectors);
      } else {
        props.setSectors((prev) => [
          ...prev,
          {
            ...draftPolygon[0],
            color,
            price: priceNumber,
          },
        ]);
      }
      handleCloseModal();
    }
  };

  const handleRemoveSector = () => {
    if (deleteSectorId) {
      props.setSectors((prev) => prev.filter((sector) => sector.id !== deleteSectorId));
      setSelectedSectorId(null);
      setDeleteSectorId(null);
    }
  };

  const handleSelectSector = (id: string) => {
    setSelectedSectorId((prev) => (prev === id ? null : id));
  };

  const onUpdate = (value: { features: DrawEventFeature[]; action: string }) => {
    setDraftPolygon(value.features);
  };

  const onCreate = (value: { features: DrawEventFeature[]; action: string }) => {
    setDraftPolygon(value.features);
  };

  const selectColors = editSector
    ? props.sectors.map((el) => el.color !== editSector.color && el.color)
    : props.sectors.map((el) => el.color);

  const handleOpenModal = () => {
    const firstColor = ZONE_COLORS.find((el) => !selectColors.includes(el.value));
    setColor(firstColor ? firstColor.value : "");
    setIsModalOpen(true);
  };

  const colorList = ZONE_COLORS.filter((el) => !selectColors.includes(el.value));

  const handleEditSector = (sector: Sector) => {
    setIsModalOpen(true);
    setColor(sector.color);
    setPrice(String(sector.price));
    setEditSector(sector);
    setDraftPolygon([sector]);
  };

  const selectedSector = props.sectors.find((sector) => sector.id === selectedSectorId) ?? null;

  return (
    <>
      <ModalDelete
        isOpen={deleteSectorId !== null}
        title="Вы действительно хотите удалить  сектор?"
        showSubTitle={false}
        submit={handleRemoveSector}
        onClose={() => setDeleteSectorId(null)}
        disabled={deleteSectorId === null}
      />

      <Modal active={isModalOpen} handleCloseAction={handleCloseModal}>
        <ModalContent width={1054}>
          <ModalHeader
            title={editSector ? "Редактировать сектор доставки" : "Новый сектор доставки"}
            onClose={handleCloseModal}
          />
          <ModalBody>
            <p className={styles.modalDescription}>
              Кликайте по карте, чтобы задать контур сектора. Готовый контур правится
              перетаскиванием вершин.
            </p>
            <div className={styles.mapWrapper}>
              {isModalOpen && (
                <MapMain
                  language="ru"
                  mapboxAccessToken={props.mapToken}
                  mapStyle={props.mapStyle}
                  initialViewState={{
                    longitude: props.initCenter.lng,
                    latitude: props.initCenter.lat,
                    zoom: 14,
                  }}
                  style={{ width: "100%", height: "100%" }}
                  pitch={0}
                  bearing={0}
                >
                  <Marker
                    longitude={props.initCenter.lng}
                    latitude={props.initCenter.lat}
                    anchor="bottom"
                  >
                    <CustomMarker type="pickup" size="md" active address="" />
                  </Marker>
                  <DrawControl
                    keybindings={false}
                    position="top-right"
                    displayControlsDefault={true}
                    controls={{ polygon: true, trash: true }}
                    defaultMode="draw_polygon"
                    onCreate={onCreate}
                    onUpdate={onUpdate}
                    initialFeature={editSector ? editSector : undefined}
                  />
                </MapMain>
              )}
            </div>
          </ModalBody>
          <div className={styles.drawerRow}>
            <fieldset className={styles.palette}>
              <legend className={styles.paletteLegend}>
                {colorList.length > 0 ? "Цвет сектора" : "Превышен лимит секторов"}{" "}
              </legend>
              <div className={styles.paletteList}>
                {colorList.map((item) => (
                  <label key={item.value} className={styles.swatchLabel} title={item.label}>
                    <input
                      className={styles.swatchInput}
                      type="radio"
                      name="zone-color"
                      value={item.value}
                      checked={color === item.value}
                      onChange={() => setColor(item.value)}
                    />
                    <span
                      className={styles.swatch}
                      style={
                        { "--swatch": item.value, backgroundColor: item.value } as CSSProperties
                      }
                      aria-hidden="true"
                    />
                    <span className={styles.visuallyHidden}>{item.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className={styles.priceField}>
              <Input
                value={price}
                name="delivery_price"
                id="delivery_price"
                variant="standard"
                variantSize="lg"
                min={0}
                inputMode="numeric"
                label="Цена доставки, ₽"
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>
          <ModalFooter
            cancelAction={{
              text: "Отмена",
              action: handleCloseModal,
            }}
            submitAction={{
              text: editSector ? "Редактировать" : "Добавить",
              disabled: !isValidPolygon || !isPriceValid || !color,
              action: handleAddSector,
            }}
          />
        </ModalContent>
      </Modal>
      <FormSection title="Настройка доставки">
        <div className={styles.sectionActions}>
          {selectedSector && (
            <Button
              variant="outline"
              variantColor="blue"
              size="sm"
              type="button"
              onClick={() => handleEditSector(selectedSector)}
            >
              <EditSvg />
              Редактировать выбранный
            </Button>
          )}
          <Button
            variant="solid"
            variantColor="blue"
            size="sm"
            type="button"
            onClick={handleOpenModal}
          >
            <AddSvg />
            Добавить сектор
          </Button>
        </div>
        {props.sectors.length === 0 ? (
          <p className={styles.emptyState}>Секторов пока нет. Нарисуйте первый на карте.</p>
        ) : (
          <>
            <ul className={styles.sectorList}>
              {props.sectors.map((sector) => (
                <li
                  key={sector.id}
                  className={`${styles.sectorItem} ${
                    sector.id === selectedSectorId ? styles.sectorItemActive : ""
                  }`}
                >
                  <button
                    type="button"
                    className={styles.sectorSelect}
                    onClick={() => handleSelectSector(sector.id)}
                    aria-pressed={sector.id === selectedSectorId}
                  >
                    <span
                      className={styles.sectorChip}
                      style={{ backgroundColor: sector.color }}
                      aria-hidden="true"
                    />
                    <span className={styles.sectorName}>
                      <span className={styles.sectorPrice}>
                        {priceFormatter.format(Number(sector.price))}
                      </span>
                    </span>
                  </button>
                  <button
                    title="Удалить"
                    className={styles.sectorListButton}
                    type="button"
                    onClick={() => setDeleteSectorId(sector.id)}
                  >
                    <DeleteSvg fill="#727280" />
                  </button>
                </li>
              ))}
            </ul>
            <div className={styles.zonesMap}>
              <DeliveryZonesMap
                onClickSector={handleSelectSector}
                sectors={props.sectors}
                selectedSectorId={selectedSectorId}
                center={props.initCenter}
                mapToken={props.mapToken}
                mapStyle={props.mapStyle}
              />
            </div>
          </>
        )}
        <p className={styles.sectionDescription}>
          Секторы стоимости доставки для самовывоза. Каждый сектор — отдельная зона на карте со
          своей ценой.
        </p>
      </FormSection>
    </>
  );
};
