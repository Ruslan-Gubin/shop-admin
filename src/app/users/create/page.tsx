import { PageHeader } from "@/shared/ui/page-header/PageHeader";
import { UpdateUserForm } from "../edit/[id]/update-user-form/UpdateUserForm";
import { createUserAction } from "./action";

export default async function CreateUserPage() {
  return (
    <section className="page-wrapper">
      <PageHeader title="Добавить пользователя." fallbackHref="/users" />
      <UpdateUserForm variant="create" submitAction={createUserAction} />
    </section>
  );
}
