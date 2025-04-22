import { ButtonBlack } from "@/shared/ui/button-black/Buttonblack";
import { CloseModal } from "@/shared/ui/close-modal/CloseModal";
import { Modal } from "@/shared/ui/modal/Modal";
import styles from "./ModalDelete.module.scss";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  submit: () => void;
  disabled: boolean;
  title: string;
  showSubTitle?: boolean;
  readText?: string;
};

const ModalDelete = ({
  disabled,
  isOpen,
  onClose,
  submit,
  title,
  showSubTitle = true,
  readText,
}: Props) => {
  return (
    <Modal active={isOpen} handleClose={onClose}>
      <section className={styles.modalContent}>
        <header className={styles.header}>
          <div className={styles.titleWrapper}>
            <h2 className={styles.headerTitle}>{title}</h2>
          </div>
          <CloseModal onClose={onClose} />
        </header>
        <div className={styles.content}>
          {showSubTitle && (
            <p className={styles.contentText}>
              Вы уверены, что хотите продолжить?
            </p>
          )}
          <p className={styles.contentTextRed}>
            {readText
              ? readText
              : "Это действие является постоянным и не может быть отменено!"}
          </p>
        </div>

        <div className={styles.footer}>
          <ButtonBlack
            text="Отменить"
            disabled={false}
            onClick={onClose}
            className={styles.cancelButton}
          />
          <ButtonBlack
            text="Удалить"
            disabled={disabled}
            onClick={submit}
            className={styles.submitButton}
          />
        </div>
      </section>
    </Modal>
  );
};

export { ModalDelete };

