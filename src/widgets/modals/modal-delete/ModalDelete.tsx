import { Modal } from "@/shared/ui/modal/Modal";
import { ModalBody } from "@/shared/ui/modal/modal-body/ModalBody";
import { ModalContent } from "@/shared/ui/modal/modal-content/ModalContent";
import { ModalFooter } from "@/shared/ui/modal/modal-footer/ModalFooter";
import { ModalHeader } from "@/shared/ui/modal/modal-header/ModalHeader";
import styles from "./ModalDelete.module.css";

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
    <Modal active={isOpen} handleCloseAction={onClose}>
      <ModalContent>
        <ModalHeader title={title} onClose={onClose} />
        <ModalBody>
          {showSubTitle && <p className={styles.contentText}>Вы уверены, что хотите продолжить?</p>}
          <p className={styles.contentTextRed}>
            {readText ? readText : "Это действие является постоянным и не может быть отменено!"}
          </p>
        </ModalBody>

        <ModalFooter
          cancelAction={{ action: onClose }}
          submitAction={{
            action: submit,
            disabled,
            variant: "solid",
            variantColor: "error",
            text: "Удалить",
          }}
        />
      </ModalContent>
    </Modal>
  );
};

export { ModalDelete };
