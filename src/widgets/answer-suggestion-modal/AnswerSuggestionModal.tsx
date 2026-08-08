import { Button } from "@/shared/ui/button-main/Button";
import { Modal } from "@/shared/ui/modal/Modal";
import { ModalBody } from "@/shared/ui/modal/modal-body/ModalBody";
import { ModalContent } from "@/shared/ui/modal/modal-content/ModalContent";
import { ModalHeader } from "@/shared/ui/modal/modal-header/ModalHeader";
import styles from "./AnswerSuggestionModal.module.css";

const MAX_ANSWER_LENGTH = 1000;

type Props = {
  isOpen: boolean;
  subject: string;
  subjectLabel?: string;
  fieldTitle?: string;
  title?: string;
  suggestion: string;
  currentValue: string;
  onClose: () => void;
  onApply: (answer: string) => void;
};

export const AnswerSuggestionModal = (props: Props) => {
  const alreadyApplied = props.suggestion.length > 0 && props.suggestion === props.currentValue;
  const subjectLabel = props.subjectLabel || "Вопрос";
  const fieldTitle = props.fieldTitle || "Ответ на вопрос";

  const handleApply = () => {
    props.onApply(props.suggestion);
    props.onClose();
  };

  return (
    <Modal active={props.isOpen} handleCloseAction={props.onClose}>
      <ModalContent>
        <ModalHeader title={props.title || "Рекомендация ответа"} onClose={props.onClose} />
        <ModalBody>
          <div className={styles.body}>
            <div className={`${styles.fieldRow} ${alreadyApplied ? styles.fieldRowSelected : ""}`}>
              <div className={styles.fieldHead}>
                <span className={styles.fieldTitle}>{fieldTitle}</span>
                {alreadyApplied && <span className={styles.appliedBadge}>Уже применено</span>}
              </div>
              <p className={styles.fieldHint}>
                {subjectLabel}: {props.subject}
              </p>
              {props.suggestion ? (
                <div className={styles.suggestedBlock}>
                  <div className={styles.suggestedHead}>
                    <span className={styles.suggestedLabel}>Предложенное</span>
                    <span className={styles.suggestedLength}>
                      {props.suggestion.length}/{MAX_ANSWER_LENGTH}
                    </span>
                  </div>
                  <p className={styles.suggestedValue}>{props.suggestion}</p>
                </div>
              ) : (
                <span className={styles.emptyBadge}>Не предложено</span>
              )}
            </div>
          </div>
        </ModalBody>
        <footer className={styles.footer}>
          <Button variant="ghost" size="sm" onClick={props.onClose}>
            Отмена
          </Button>
          <Button
            variant="solid"
            variantColor="green"
            size="sm"
            onClick={handleApply}
            disabled={alreadyApplied || props.suggestion.length === 0}
          >
            Применить
          </Button>
        </footer>
      </ModalContent>
    </Modal>
  );
};
