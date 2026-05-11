import type { ReactNode } from "react";
import { Suspense } from "react";
import { MainImage } from "@/shared/ui/image-main/ImageMain";
import styles from "./LayoutLeftSide.module.css";
import { NavigateMenu } from "./NavigateMenu/NavigateMenu";
import { CartDiscountsSvg } from "./svg/CartDiscountsSvg";
import { CategorySvg } from "./svg/CategorySvg";
import { FeaturesSvg } from "./svg/FeaturesSvg";
import { PriceAutoFillSvg } from "./svg/PriceAutoFillSvg";
import { PriceTypeSvg } from "./svg/PriceTypeSvg";
import { PromotionsSvg } from "./svg/PromotionsSvg";
import { RegisterSvg } from "./svg/RegisterSvg";
import { UsersSvg } from "./svg/UsersSvg";

export type NavigateListItem = {
  label: string;
  href: string;
  icon?: ReactNode;
  children: NavigateListItem[];
  isHasLine?: boolean;
};

export const LayoutLeftSide = () => {
  const navigateList: NavigateListItem[] = [
    {
      label: "Список товаров",
      href: "/",
      icon: <RegisterSvg />,
      children: [
        {
          label: "Добавить товар",
          href: "/product/create",
          children: [],
          isHasLine: false,
        },
      ],
    },
    {
      label: "Список пользователей",
      href: "/users",
      icon: <UsersSvg />,
      isHasLine: false,
      children: [
        {
          label: "Добавить пользователя",
          href: "/users/create",
          isHasLine: false,
          children: [],
        },
      ],
    },
    {
      label: "Категории",
      href: "/category",
      icon: <CategorySvg />,
      children: [],
    },
    {
      label: "Типы цен",
      href: "/price-types",
      icon: <PriceTypeSvg />,
      children: [],
    },
    {
      label: "Характеристики",
      href: "/specifications",
      icon: <FeaturesSvg />,
      children: [],
    },
    {
      label: "Скидки на корзину",
      href: "/cart-discounts",
      icon: <CartDiscountsSvg />,
      children: [],
    },
    {
      label: "Акции",
      href: "/promotions",
      icon: <PromotionsSvg />,
      children: [],
    },
    {
      label: "Автозаполнение",
      href: "/price-auto-fill",
      icon: <PriceAutoFillSvg />,
      children: [],
    },
  ];

  return (
    <>
      <div className={styles.navigateLogoContainer}>
        <MainImage src={"/assets/logo.png"} alt="Logo image" classContainer={styles.logoImage} />
      </div>
      <nav className={styles.navigateMenuNav}>
        <Suspense fallback={<div>Loading...</div>}>
          <NavigateMenu navigateList={navigateList} />
        </Suspense>
      </nav>
    </>
  );
};
