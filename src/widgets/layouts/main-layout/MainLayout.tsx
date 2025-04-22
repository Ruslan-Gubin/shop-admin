"use client";
import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import { LayoutNavigation } from "../layout-navigations/LayoutNavigation";
import { LayoutHeader } from "../layout-header/LayoutHeader";

import styles from "./MainLayout.module.scss";

type Props = {
  children: ReactNode;
};

const MainLayout = ({ children }: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const pathname = usePathname();

  const titleMap: Record<string, string> = {
    "/product/create": "Добавить товар",
    "/": "Список товаров",
  };

  return (
    <main className={styles.root}>
      <LayoutNavigation
        isOpen={isOpen}
        onToggleMenu={() => setIsOpen((prev) => !prev)}
      />
      <div
        className={
          !isOpen ? `${styles.content} ${styles.contentOpen}` : styles.content
        }
      >
        <LayoutHeader title={titleMap[pathname]} />
        {children}
      </div>
    </main>
  );
};

export { MainLayout };
