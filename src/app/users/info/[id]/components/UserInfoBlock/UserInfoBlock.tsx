import Link from "next/link";
import type { UserModel } from "@/app/users/action";
import { userRoleTranslations } from "@/shared/translate/user-translates";
import { Button } from "@/shared/ui/button-main/Button";
import { FormSection } from "@/widgets/form-section/FormSection";
import styles from "./UserInfoBlock.module.css";

const MOCK_PHOTO =
  "https://avatars.mds.yandex.net/get-shedevrum/11477113/41d3c57ebc6b11eea5772e703d58be2f/orig";

type Props = {
  user: UserModel;
};

export const UserInfoBlock = (props: Props) => {
  const formatter = Intl.DateTimeFormat("ru", {
    year: "numeric",
    month: "long",
    day: "numeric",
    minute: "2-digit",
    hour: "2-digit",
  });

  return (
    <FormSection title="Общие данные">
      <div className={styles.content}>
        <div className={styles.topRow}>
          <div className={styles.photoContainer}>
            <picture>
              <img
                className={styles.photo}
                src={props.user.photo || MOCK_PHOTO}
                alt="Фото пользователя"
              />
            </picture>
          </div>

          <div className={styles.fields}>
            <p className={styles.fieldValue}>
              <span className={styles.fieldLabel}>ID: </span>
              {props.user.id}
            </p>
            <p className={styles.fieldValue}>
              <span className={styles.fieldLabel}>Имя: </span>
              {props.user.name || "-/-"}
            </p>
            <p className={styles.fieldValue}>
              <span className={styles.fieldLabel}>Email: </span>
              {props.user.email || "-/-"}
            </p>
            <p className={styles.fieldValue}>
              <span className={styles.fieldLabel}>Телефон: </span>
              {props.user.phone || "-/-"}
            </p>
            <p className={styles.fieldValue}>
              <span className={styles.fieldLabel}>Роль: </span>
              {userRoleTranslations[props.user.role] || "Роль не определена"}
            </p>
          </div>
        </div>

        <div className={styles.bottomRow}>
          {props.user.created_at && (
            <p className={styles.fieldValue}>
              <span className={styles.fieldLabel}>Дата регистрации: </span>
              {formatter.format(new Date(props.user.created_at))}
            </p>
          )}
          <Link href={`/users/edit/${props.user.id}`}>
            <Button variant="link" variantColor="blue">
              Редактировать
            </Button>
          </Link>
        </div>
      </div>
    </FormSection>
  );
};
