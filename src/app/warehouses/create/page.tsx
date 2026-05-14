"use server";
import { WarehouseForm } from "../components/WarehouseForm/WarehouseForm";
import { createWarehouseAction, type WarehousePayload } from "./action";

export default async function CreateWarehousePage() {
  const initValue: WarehousePayload = {
    name: "",
    address: "",
    area: "",
    city: "",
    street: "",
    house: "",
    index: "",
    office: "",
    description: "",
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
    <section className="page-wrapper">
      <h2>Создать склад</h2>
      <WarehouseForm
        submitAction={submitAction}
        initValues={initValue}
        variant="create"
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
      />
    </section>
  );
}

