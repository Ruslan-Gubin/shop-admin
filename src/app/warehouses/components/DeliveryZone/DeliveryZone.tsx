"use client";
import { type CSSProperties, useState } from "react";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import "mapbox-gl/dist/mapbox-gl.css";
import { Map as MapMain, Marker } from "react-map-gl/mapbox";
import { AddSvg } from "@/app/category/components/category-item/svg/AddSvg";
import { Button } from "@/shared/ui/button-main/Button";
import { Input } from "@/shared/ui/input-main/Input";
import { CustomMarker } from "@/shared/ui/mapbox/map-marker/CustomMarker";
import { Modal } from "@/shared/ui/modal/Modal";
import { ModalBody } from "@/shared/ui/modal/modal-body/ModalBody";
import { ModalContent } from "@/shared/ui/modal/modal-content/ModalContent";
import { ModalFooter } from "@/shared/ui/modal/modal-footer/ModalFooter";
import { ModalHeader } from "@/shared/ui/modal/modal-header/ModalHeader";
import { FormSection } from "@/widgets/form-section/FormSection";
import { DrawControl, type DrawEventFeature } from "../DrawControl/DrawControl";
import styles from "./DeliveryZone.module.css";
import { DeliveryZonesMap } from "./DeliveryZonesMap";

export interface Sector extends DrawEventFeature {
  color: string;
  price: number;
}

type Props = {
  initCenter: { lat: number; lng: number };
  mapToken: string;
  mapStyle: string;
};

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

export const DeliveryZone = (props: Props) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [color, setColor] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [draftPolygon, setDraftPolygon] = useState<DrawEventFeature[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [editSector, setEditSector] = useState<Sector | null>(null);

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
    price.trim() !== "" &&
    !Number.isNaN(priceNumber) &&
    Number.isFinite(priceNumber) &&
    priceNumber > 0;

  const isValidPolygon =
    draftPolygon.length > 0 &&
    draftPolygon[0].id &&
    draftPolygon[0]?.geometry?.coordinates?.length > 0;

  const handleAddSector = () => {
    if (isValidPolygon && isPriceValid) {
      if (editSector) {
        const updateSectors = [];

        for (let i = 0; i < sectors.length; i++) {
          if (sectors[i].id === editSector.id) {
            updateSectors.push({
              ...draftPolygon[0],
              color,
              price: priceNumber,
            });
          } else {
            updateSectors.push(sectors[i]);
          }
        }

        setSectors(updateSectors);
      } else {
        setSectors((prev) => [
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

  const handleRemoveSector = (id: string) => {
    setSectors((prev) => prev.filter((sector) => sector.id !== id));
  };

  const onUpdate = (value: { features: DrawEventFeature[]; action: string }) => {
    setDraftPolygon(value.features);
  };

  const onCreate = (value: { features: DrawEventFeature[]; action: string }) => {
    setDraftPolygon(value.features);
  };

  const selectColors = editSector
    ? sectors.map((el) => el.color !== editSector.color && el.color)
    : sectors.map((el) => el.color);

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

  return (
    <>
      <Modal active={isModalOpen} handleCloseAction={handleCloseModal}>
        <ModalContent>
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
        <div className={styles.sectionHeader}>
          <p className={styles.sectionDescription}>
            Секторы стоимости доставки для самовывоза. Каждый сектор — отдельная зона на карте со
            своей ценой.
          </p>
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
        {sectors.length === 0 ? (
          <p className={styles.emptyState}>Секторов пока нет. Нарисуйте первый на карте.</p>
        ) : (
          <>
            <ul className={styles.sectorList}>
              {sectors.map((sector) => (
                <li key={sector.id} className={styles.sectorItem}>
                  <span
                    className={styles.sectorChip}
                    style={{ backgroundColor: sector.color }}
                    aria-hidden="true"
                  />
                  <span className={styles.sectorName}>
                    <span className={styles.sectorPrice}>
                      {sector.price.toLocaleString("ru-RU")} ₽
                    </span>
                  </span>
                  <Button
                    variant="ghost"
                    variantColor="blue"
                    size="sm"
                    type="button"
                    onClick={() => handleEditSector(sector)}
                  >
                    Редактировать
                  </Button>
                  <Button
                    variant="ghost"
                    variantColor="error"
                    size="sm"
                    type="button"
                    onClick={() => handleRemoveSector(sector.id)}
                  >
                    Удалить
                  </Button>
                </li>
              ))}
            </ul>
            <div className={styles.zonesMap}>
              <DeliveryZonesMap
                sectors={sectors}
                center={props.initCenter}
                mapToken={props.mapToken}
                mapStyle={props.mapStyle}
              />
            </div>
          </>
        )}
      </FormSection>
    </>
  );
};
