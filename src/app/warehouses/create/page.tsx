"use server";
import { fetchReverseAction } from "@/app/action";
import { CONFIG_APP } from "@/shared/config/config";
import { UpdateToken } from "@/views/UpdateToken/UpdateToken";
import { WarehouseForm } from "../components/WarehouseForm/WarehouseForm";
import { createWarehouseAction, fetchDefaultWarehouse, type WarehousePayload } from "./action";

export default async function CreateWarehousePage() {
  const defaultWarehouse = await fetchDefaultWarehouse();
  const defaultCenter =
    defaultWarehouse?.data?.address?.lng && defaultWarehouse?.data?.address?.lat
      ? { lng: defaultWarehouse.data.address.lng, lat: defaultWarehouse.data.address.lat }
      : { lng: 37.80358599891716, lat: 48.013597598505555 };

  const initValue: WarehousePayload = {
    name: "",
    description: "",
    address_name: "",
    entrance: "",
    flat: "",
    floor: "",
    intercom: "",
    place: "",
    lng: 0,
    lat: 0,
    is_active: true,
    default_warehouse: false,
    is_public: true,
  };

  const submitAction = async (payload: WarehousePayload) => {
    "use server";

    let notification: { status: "error" | "success"; message: string } | null = null;
    let errors: Record<keyof WarehousePayload, string> | null = null;
    let updateValues: WarehousePayload | null = null;

    await createWarehouseAction(payload).then(async (response) => {
      errors = response.errors;

      if (response.status === "success" && response.data) {
        notification = {
          status: "success",
          message: "Склад удачно создан",
        };

        updateValues = initValue;
      } else {
        notification = {
          status: "error",
          message: "Ошибка при заполнении формы",
        };
      }
    });

    return { errors, notification, updateValues };
  };

  return (
    <>
      {defaultWarehouse?.tokens && <UpdateToken tokens={defaultWarehouse.tokens} />}
      <section className="page-wrapper">
        <h2>Создать склад</h2>
        <WarehouseForm
          initCenter={defaultCenter}
          fetchReverseAction={fetchReverseAction}
          mapStyle={CONFIG_APP.MAPBOX_STYLE}
          mapToken={CONFIG_APP.MAPBOX_ACCESS_TOKEN}
          submitAction={submitAction}
          initValues={initValue}
          variant="create"
          initErrors={{
            name: "",
            description: "",
            default_warehouse: "",
            is_active: "",
            is_public: "",
            address_name: "",
            entrance: "",
            flat: "",
            floor: "",
            intercom: "",
            lat: "",
            lng: "",
            place: "",
          }}
        />
      </section>
    </>
  );
}
