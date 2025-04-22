import { MainImage } from "../image-main/ImageMain";

import styles from "./CloseModal.module.scss";

type Props = {
  onClose?: () => void;
};

const CloseModal = ({ onClose }: Props) => {
  return (
    <button onClick={onClose} className={styles.closeButton}>
      <MainImage src={"/assets/modal/close-modal.png"} alt="close modal png" />
    </button>
  );
};

export { CloseModal };
