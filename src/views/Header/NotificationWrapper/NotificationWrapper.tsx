import { NavbarItem } from "@/shared/ui/navbar-item/NavbarItem";
import { LogisticsSvg } from "@/views/LayoutLeftSide/svg/LogisticsSvg";
import { OrdersSvg } from "@/views/LayoutLeftSide/svg/OrdersSvg";
import { QuestionSvg } from "@/views/LayoutLeftSide/svg/QuestionSvg";
import { ReviewSvg } from "@/views/LayoutLeftSide/svg/ReviewSvg";
import styles from "./NotificationWrapper.module.css";

type Props = {
  order: number;
  transfer: number;
  question: number;
  reviews: number;
};

export const NotificationWrapper = (props: Props) => {
  return (
    <ul className={styles.notificationList}>
      <NavbarItem active={true} count={props.order} href="/orders" label="" svg={<OrdersSvg />} />
      <NavbarItem
        active={true}
        count={props.transfer}
        href="/transfer"
        label=""
        svg={<LogisticsSvg />}
      />
      <NavbarItem
        active={true}
        count={props.question}
        href="/product-questions"
        label=""
        svg={<QuestionSvg />}
      />

      <NavbarItem
        active={true}
        count={props.reviews}
        href="/product-reviews"
        label=""
        svg={<ReviewSvg />}
      />
    </ul>
  );
};
