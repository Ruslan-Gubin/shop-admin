"use server";
import { revalidatePath } from "next/cache";
import { fetchReverseAction } from "@/app/action";
import { CONFIG_APP } from "@/shared/config/config";
import { ErrorAlert } from "@/shared/ui/error-alert/ErrorAlert";
import { UpdateToken } from "@/views/UpdateToken/UpdateToken";
import { WarehouseForm } from "../../components/WarehouseForm/WarehouseForm";
import type { WarehousePayload } from "../../create/action";
import { fetchWarehouseEditPage, updateWarehouseAction } from "./action";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditWarehousePage(props: Props) {
  const { id } = await props.params;
  const warehouseData = await fetchWarehouseEditPage(id);

  const warehouse = warehouseData.data;

  const defaultCenter =
    warehouse?.address?.lng && warehouse?.address?.lat
      ? { lng: warehouse.address.lng, lat: warehouse.address.lat }
      : { lng: 37.80358599891716, lat: 48.013597598505555 };

  const initValue: WarehousePayload = {
    name: warehouse?.name || "",
    description: warehouse?.description || "",
    address_name: warehouse?.address?.name || "",
    entrance: warehouse?.address?.entrance || "",
    flat: warehouse?.address?.flat || "",
    floor: warehouse?.address?.floor || "",
    intercom: warehouse?.address?.intercom || "",
    place: warehouse?.address?.place || "",
    lng: warehouse?.address?.lng || 0,
    lat: warehouse?.address?.lat || 0,
    is_active: warehouse ? warehouse.is_active : false,
    default_warehouse: warehouse ? warehouse.default_warehouse : false,
    is_public: warehouse ? warehouse.is_public : false,
  };

  const submitAction = async (payload: WarehousePayload) => {
    "use server";

    let notification: { status: "error" | "success"; message: string } | null = null;
    let errors: Record<keyof WarehousePayload, string> | null = null;

    await updateWarehouseAction(payload, id).then(async (response) => {
      errors = response.errors;

      if (response.status === "success") {
        revalidatePath("product/edit");
        notification = {
          status: "success",
          message: "Склад удачно изменен",
        };
      } else {
        notification = {
          status: "error",
          message: "Ошибка при редактировании склада",
        };
      }
    });

    return { errors, notification, updateValues: null };
  };

  return (
    <section className="page-wrapper">
      {warehouseData.tokens && <UpdateToken tokens={warehouseData.tokens} />}
      <h2>Редактировать склад</h2>
      {!warehouseData.data && <ErrorAlert message={warehouseData.message || "Склад не найден"} />}
      <WarehouseForm
        mapStyle={CONFIG_APP.MAPBOX_STYLE}
        mapToken={CONFIG_APP.MAPBOX_ACCESS_TOKEN}
        fetchReverseAction={fetchReverseAction}
        initCenter={defaultCenter}
        submitAction={submitAction}
        initValues={initValue}
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
        variant="edit"
      />
    </section>
  );
}
