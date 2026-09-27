"use server";
import { revalidatePath } from "next/cache";
import { fetchReverseAction } from "@/app/action";
import { CONFIG_APP } from "@/shared/config/config";
import { ErrorAlert } from "@/shared/ui/error-alert/ErrorAlert";
import { PageHeader } from "@/shared/ui/page-header/PageHeader";
import { UpdateToken } from "@/views/UpdateToken/UpdateToken";
import { WarehouseForm } from "../../components/WarehouseForm/WarehouseForm";
import type { WarehousePayload } from "../../create/action";
import {
  fetchWarehouseEditPage,
  type SectionItemPayload,
  updateSectionAction,
  updateWarehouseAction,
} from "./action";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditWarehousePage(props: Props) {
  const { id } = await props.params;
  const [warehouseData, sectorsData] = await fetchWarehouseEditPage(id);

  const warehouse = warehouseData.data;
  const sectors = sectorsData.data || [];

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

  const submitAction = async (payload: WarehousePayload, sectionsPayload: SectionItemPayload[]) => {
    "use server";
    let notification: { status: "error" | "success"; message: string } | null = null;
    let errors: Record<keyof WarehousePayload, string> | null = null;

    await updateWarehouseAction(payload, id).then(async (response) => {
      errors = response.errors;

      if (response.status === "success") {
        if (sectionsPayload.length > 0) {
          updateSectionAction(sectionsPayload, id)
            .then((response) => {
              if (response.status === "success") {
                revalidatePath("product/edit");
              } else {
                throw response.message;
              }
            })
            .catch((error) => {
              notification = {
                status: "error",
                message: error || "Ошибка при редактировании сектора",
              };
            });
        }

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
      {sectorsData.tokens && <UpdateToken tokens={sectorsData.tokens} />}
      <PageHeader title="Редактировать склад" fallbackHref="/warehouses" />
      {!warehouseData.data && <ErrorAlert message={warehouseData.message || "Склад не найден"} />}
      {!sectorsData.data && sectorsData.status === "error" && sectorsData.message.length > 0 && (
        <ErrorAlert message={sectorsData.message} />
      )}
      <WarehouseForm
        sectors={sectors}
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
