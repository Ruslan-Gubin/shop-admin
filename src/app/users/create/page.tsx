import { UpdateUserForm } from "../edit/[id]/update-user-form/UpdateUserForm";
import { createUserAction } from "./action";
import styles from "./CreateUser.module.css";

export default async function CreateUserPage() {
  return (
    <div className={styles.root}>
      <UpdateUserForm submitAction={createUserAction} />
    </div>
  );
}
