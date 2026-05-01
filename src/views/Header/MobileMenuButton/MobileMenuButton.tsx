import styles from "./MobileMenuButton.module.css";
import { MobileMenuButtonCloseSvg } from "./svg/MobileMenuButtonCloseSvg";
import { MobileMenuButtonSvg } from "./svg/MobileMenuButtonSvg";

type Props = {
  onClick: () => void;
  disabled?: boolean;
  isActive: boolean;
};

export const MobileMenuButton = (props: Props) => {
  return (
    <button
      onClick={props.onClick}
      disabled={props.disabled}
      type="button"
      className={styles.mobileMenuButton}
    >
      {props.isActive ?<MobileMenuButtonCloseSvg /> : <MobileMenuButtonSvg />  }
    </button>
  );
};
