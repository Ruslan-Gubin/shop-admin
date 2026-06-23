import { UserSvg } from "@/shared/svg/UserSvg";
import { WarehouseSvg } from "@/shared/svg/WarehouseSvg";
import styles from "./CustomMarker.module.css";

type Props = {
  address: string;
  type: "pickup" | "courier";
  size: "sm" | "md" | "lg";
  active: boolean;
};

export const CustomMarker = (props: Props) => {
  return (
    <div className={styles.marker}>
      {props.active && (
        <div
          className={
            !props.address
              ? `${styles.infoContainer} ${styles.infoContainerNotAddress}`
              : styles.infoContainer
          }
        >
          <div className={styles.svgContainer}>
            {props.type === "courier" && <UserSvg />}
            {props.type === "pickup" && <WarehouseSvg />}
          </div>
          {props.address && <span className={styles.addressText}>{props.address}</span>}
        </div>
      )}
      <div
        className={`${styles.point} ${!props.active && props.size === "md" ? styles.pointMdSize : ""} ${!props.active && props.size === "lg" ? styles.pointLgSize : ""} ${!props.active && props.size === "sm" ? styles.pointSmSize : ""}`}
      >
        {!props.active && (
          <>
            {props.type === "courier" && <UserSvg />}
            {props.type === "pickup" && <WarehouseSvg />}
          </>
        )}
      </div>
    </div>
  );
};
