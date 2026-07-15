import Link from "next/link";
import styles from "./SummaryCards.module.css";

type Props = {
  users: number;
  products: number;
  orders: number;
  transfers: number;
};

export const SummaryCards = (props: Props) => {
  const cards = [
    { label: "Пользователей", value: props.users, href: "/users" },
    { label: "Заказов", value: props.orders, href: "/orders" },
    { label: "Перемещений", value: props.transfers, href: "/transfer" },
    { label: "Товаров", value: props.products, href: "/product" },
  ];

  return (
    <ul className={styles.grid}>
      {cards.map((card) => (
        <li key={card.href} className={styles.card}>
          <Link href={card.href} className={styles.cardLink}>
            <span className={styles.cardValue}>{card.value}</span>
            <span className={styles.cardLabel}>{card.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
};
