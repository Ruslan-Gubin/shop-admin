"use client";
import { useRouter } from "next/navigation";
import { ArrowRightSvg } from "@/shared/svg/ArrowRightSvg";
import styles from "./BackButton.module.css";

type Props = {
  fallbackHref?: string;
};

export const BackButton = (props: Props) => {
  const router = useRouter();

  const handleClick = () => {
    const hasHistory = typeof window !== "undefined" && window.history.length > 1;

    if (!hasHistory && props.fallbackHref) {
      router.push(props.fallbackHref);
    } else if (hasHistory) {
      router.back();
    }
  };

  return (
    <button type="button" className={styles.button} onClick={handleClick} aria-label="Назад" title="Назад">
      <div className={styles.icon}>
        <ArrowRightSvg />
      </div>
    </button>
  );
};
