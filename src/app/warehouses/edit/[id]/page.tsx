"use server";
import { revalidatePath } from "next/cache";
import { ErrorAlert } from "@/shared/ui/error-alert/ErrorAlert";
import { UpdateToken } from "@/views/UpdateToken/UpdateToken";
import { fetchWarehouse } from "../../action";
import { WarehouseForm } from "../../components/WarehouseForm/WarehouseForm";
import type { WarehousePayload } from "../../create/action";
import { updateWarehouseAction } from "./action";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditWarehousePage(props: Props) {
  const { id } = await props.params;
  const warehouseData = await fetchWarehouse(id);

  const warehouse = warehouseData.data;

  const initValue: WarehousePayload = {
    name: warehouse?.name || "",
    address: warehouse?.address || "",
    area: warehouse?.area || "",
    city: warehouse?.city || "",
    street: warehouse?.street || "",
    house: warehouse?.house || "",
    index: warehouse?.index || "",
    office: warehouse?.office || "",
    description: warehouse?.description || "",
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
        submitAction={submitAction}
        initValues={initValue}
        initErrors={{
          name: "",
          address: "",
          area: "",
          city: "",
          default_warehouse: "",
          house: "",
          index: "",
          description: "",
          is_active: "",
          is_public: "",
          office: "",
          street: "",
        }}
        variant="edit"
      />
    </section>
  );
}
