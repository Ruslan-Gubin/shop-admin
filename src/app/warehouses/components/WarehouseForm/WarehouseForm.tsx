"use client";
import { useLayoutEffect, useState, useTransition } from "react";
import { AddSvg } from "@/app/category/components/category-item/svg/AddSvg";
import { EditSvg } from "@/app/category/components/category-item/svg/EditSvg";
import { CancelSvg } from "@/shared/svg/CancelSvg";
import { Button } from "@/shared/ui/button-main/Button";
import { Checkbox } from "@/shared/ui/checkbox/Checkbox";
import { Input } from "@/shared/ui/input-main/Input";
import { type AddressItem, MapBox } from "@/shared/ui/mapbox/Mapbox";
import { notificationAdapter } from "@/stores/notification/adapter";
import type { WarehousePayload } from "../../create/action";
import styles from "./WarehouseForm.module.css";

type Props = {
  submitAction: (payload: WarehousePayload) => Promise<{
    errors: Record<keyof WarehousePayload, string> | null;
    notification: {
      status: "error" | "success";
      message: string;
    } | null;
    updateValues: WarehousePayload | null;
  }>;
  initValues: WarehousePayload;
  initErrors: Record<keyof WarehousePayload, string>;
  initCenter: { lng: number; lat: number };
  variant: "create" | "edit";
  mapToken: string;
  mapStyle: string;
  fetchReverseAction: (
    lng: number,
    lat: number,
  ) => Promise<{
    lng: number;
    lat: number;
    name: string;
    place: string;
  }>;
};

export const WarehouseForm = (props: Props) => {
  const [pending, transition] = useTransition();
  const [values, setValues] = useState<WarehousePayload>(props.initValues);
  const [errors, setErrors] = useState<Record<keyof WarehousePayload, string>>(props.initErrors);
  const [active, setActive] = useState<{ lng: number; lat: number }>({ lng: 0, lat: 0 });

  useLayoutEffect(() => {
    setValues(props.initValues);
    setErrors(props.initErrors);
    if (props.initValues.lng && props.initValues.lat) {
      setActive({ lng: props.initValues.lng, lat: props.initValues.lat });
    }
  }, []);

  const handleChangeValues = (field: string, value: string | boolean) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const submitForm = () => {
    transition(() => {
      props.submitAction(values).then((response) => {
        if (response.errors) {
          setErrors(response.errors);
        }

        if (response.notification) {
          notificationAdapter.add(response.notification.message, response.notification.status);
        }

        if (response.updateValues) {
          setValues(response.updateValues);
        }
      });
    });
  };

  const markers =
    typeof values.lng === "number" && typeof values.lat === "number"
      ? ([
          {
            type: "pickup",
            name: values.address_name,
            lng: values.lng,
            lat: values.lat,
            place: values.place,
            entrance: "",
            flat: "",
            floor: "",
            intercom: "",
          },
        ] as AddressItem[])
      : ([] as AddressItem[]);

  const handleClickMap = (lng: number, lat: number) => {
    if (typeof lng === "number" && typeof lat === "number") {
      props.fetchReverseAction(lng, lat).then((response) => {
        setValues((prev) => ({
          ...prev,
          lng: response.lng,
          lat: response.lat,
          place: response.place,
          address_name: response.name,
        }));
        setActive({ lng: response.lng, lat: response.lat });
      });
    }
  };

  return (
    <section className={styles.addForm}>
      <Input
        error={errors.name}
        value={values.name}
        name="warehouse_name"
        id="warehouse_name"
        variant="outlined"
        variantSize="sm"
        label="Название"
        rightIcon={<CancelSvg />}
        onChange={(e) => handleChangeValues("name", e.target.value)}
        onClickRightIcon={() => handleChangeValues("name", "")}
      />
      <Input
        error={errors.description}
        value={values.description}
        name="warehouse_description"
        id="warehouse_description"
        variant="outlined"
        variantSize="sm"
        label="Описание"
        rightIcon={<CancelSvg />}
        onChange={(e) => handleChangeValues("description", e.target.value)}
        onClickRightIcon={() => handleChangeValues("description", "")}
      />
      <div className={styles.mapContainer}>
        <div className={styles.mapContainerInputs}>
          <Input
            error={errors.address_name}
            value={values.address_name}
            name="warehouse_city"
            id="warehouse_city"
            variant="outlined"
            variantSize="sm"
            label="Адрес"
            rightIcon={<CancelSvg />}
            onChange={(e) => handleChangeValues("address_name", e.target.value)}
            onClickRightIcon={() => handleChangeValues("address_name", "")}
          />
          <Input
            error={errors.place}
            value={values.place}
            name="warehouse_place"
            id="warehouse_place"
            variant="outlined"
            variantSize="sm"
            label="Место"
            rightIcon={<CancelSvg />}
            onChange={(e) => handleChangeValues("place", e.target.value)}
            onClickRightIcon={() => handleChangeValues("place", "")}
          />
          <Input
            error={errors.flat}
            value={values.flat}
            name="warehouse_flat"
            id="warehouse_flat"
            variant="outlined"
            variantSize="sm"
            label="Квартира"
            rightIcon={<CancelSvg />}
            onChange={(e) => handleChangeValues("flat", e.target.value)}
            onClickRightIcon={() => handleChangeValues("flat", "")}
          />
          <Input
            error={errors.entrance}
            value={values.entrance}
            name="warehouse_entrance"
            id="warehouse_entrance"
            variant="outlined"
            variantSize="sm"
            label="Подъезд"
            rightIcon={<CancelSvg />}
            onChange={(e) => handleChangeValues("entrance", e.target.value)}
            onClickRightIcon={() => handleChangeValues("entrance", "")}
          />
          <Input
            error={errors.intercom}
            value={values.intercom}
            name="warehouse_intercom"
            id="warehouse_intercom"
            variant="outlined"
            variantSize="sm"
            label="Домофон"
            rightIcon={<CancelSvg />}
            onChange={(e) => handleChangeValues("intercom", e.target.value)}
            onClickRightIcon={() => handleChangeValues("intercom", "")}
          />
          <Input
            error={errors.floor}
            value={values.floor}
            name="warehouse_floor"
            id="warehouse_floor"
            variant="outlined"
            variantSize="sm"
            label="Этаж"
            rightIcon={<CancelSvg />}
            onChange={(e) => handleChangeValues("floor", e.target.value)}
            onClickRightIcon={() => handleChangeValues("floor", "")}
          />
        </div>

        <div className={styles.mapWrapper}>
          <MapBox
            onClickMap={handleClickMap}
            active={active}
            initCenter={props.initCenter}
            markers={markers}
            initZoom={15}
            mapboxAccessToken={props.mapToken}
            mapStyle={props.mapStyle}
            width={"100%"}
            height={"100%"}
            hasFullScreen
          />
        </div>
      </div>

      <Checkbox
        onChange={() => handleChangeValues("is_active", !values.is_active)}
        checked={values.is_active}
        name="warehouse_is_active"
        labelText="Активен"
      />
      <Checkbox
        onChange={() => handleChangeValues("is_public", !values.is_public)}
        checked={values.is_public}
        name="warehouse_is_public"
        labelText="Публичный (виден клиентам)"
      />
      <Checkbox
        onChange={() => handleChangeValues("default_warehouse", !values.default_warehouse)}
        checked={values.default_warehouse}
        name="warehouse_default_warehouse"
        labelText="Склад по умолчанию"
      />

      <div className={styles.actionForm}>
        <Button
          size="sm"
          variant="solid"
          variantColor="green"
          onClick={submitForm}
          type="button"
          disabled={pending || values.lng < 1 || values.lat < 1}
        >
          {props.variant === "create" ? <AddSvg /> : <EditSvg />}
          {props.variant === "create" ? "Создать склад" : "Редактировать"}
        </Button>
      </div>
    </section>
  );
};
