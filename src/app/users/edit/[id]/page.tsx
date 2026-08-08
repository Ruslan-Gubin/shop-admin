import { ErrorAlert } from "@/shared/ui/error-alert/ErrorAlert";
import { PageHeader } from "@/shared/ui/page-header/PageHeader";
import { UpdateToken } from "@/views/UpdateToken/UpdateToken";
import { fetchUser, type UpdateUserPayload, updateUserAction } from "./action";
import { UpdateUserForm } from "./update-user-form/UpdateUserForm";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await fetchUser(id);

  const submitEditUser = async (payload: UpdateUserPayload) => {
    "use server";
    return updateUserAction(payload, id);
  };

  return (
    <section className="page-wrapper">
      {user?.tokens && <UpdateToken tokens={user.tokens} />}
      <PageHeader title="Редактировать пользователя." fallbackHref="/users" />
      {user.status === "error" && user.message && <ErrorAlert message={user.message} />}
      {user?.data && typeof id === "string" && (
        <UpdateUserForm
          variant="edit"
          submitAction={submitEditUser}
          initValue={{
            name: user.data.name,
            phone: user.data.phone,
            email: user.data.email,
            role: user.data.role,
            photo: user.data.photo,
          }}
        />
      )}
    </section>
  );
}
