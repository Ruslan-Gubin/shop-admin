import { ErrorAlert } from "@/shared/ui/error-alert/ErrorAlert";
import { UpdateToken } from "@/views/UpdateToken/UpdateToken";
import { fetchUser, updateUserAction } from "./action";
import styles from "./EditUser.module.css";
import { UpdateUserForm } from "./update-user-form/UpdateUserForm";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await fetchUser(id);

  return (
    <div>
      {user?.tokens && <UpdateToken tokens={user.tokens} />}
      {user.status === "error" && user.message && <ErrorAlert message={user.message} />}
      <div className={styles.root}>
        {user?.data && typeof id === "string" && (
          <UpdateUserForm
            submitAction={updateUserAction}
            initValue={{
              name: user.data.name,
              phone: user.data.phone,
              email: user.data.email,
              role: user.data.role,
              photo: user.data.photo,
              id,
            }}
          />
        )}
      </div>
    </div>
  );
}
