import Link from "next/link";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { MainImage } from "@/shared/ui/image-main/ImageMain";
import styles from "./LayoutLeftSide.module.css";
import { NavigateMenu } from "./NavigateMenu/NavigateMenu";
import { CartDiscountsSvg } from "./svg/CartDiscountsSvg";
import { CategorySvg } from "./svg/CategorySvg";
import { FeaturesSvg } from "./svg/FeaturesSvg";
import { LogisticsSvg } from "./svg/LogisticsSvg";
import { OrdersSvg } from "./svg/OrdersSvg";
import { PriceAutoFillSvg } from "./svg/PriceAutoFillSvg";
import { PriceTypeSvg } from "./svg/PriceTypeSvg";
import { PromotionsSvg } from "./svg/PromotionsSvg";
import { QuestionSvg } from "./svg/QuestionSvg";
import { RegisterSvg } from "./svg/RegisterSvg";
import { ReviewSvg } from "./svg/ReviewSvg";
import { SearchSvg } from "./svg/SearchSvg";
import { UsersSvg } from "./svg/UsersSvg";
import { WarehousesSvg } from "./svg/WarehousesSvg";

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
      href: "/product",
      icon: <RegisterSvg />,
      children: [
        {
          label: "Создать товар",
          href: "/product/create",
          children: [],
          isHasLine: false,
        },
      ],
    },
    {
      label: "Заказы",
      href: "/orders",
      icon: <OrdersSvg />,
      isHasLine: false,
      children: [],
    },
    {
      label: "Склады",
      href: "/warehouses",
      icon: <WarehousesSvg />,
      children: [
        {
          label: "Создать склад",
          href: "/warehouses/create",
          children: [],
          isHasLine: false,
        },
        {
          label: "Приход товара",
          href: "/stock/income",
          children: [],
          isHasLine: false,
        },
      ],
    },
    {
      label: "Логистика",
      href: "/transfer",
      icon: <LogisticsSvg />,
      isHasLine: false,
      children: [],
    },
    {
      label: "Вопросы к товарам",
      href: "/product-questions",
      icon: <QuestionSvg />,
      isHasLine: false,
      children: [],
    },
    {
      label: "Отзывы к товарам",
      href: "/product-reviews",
      icon: <ReviewSvg />,
      isHasLine: false,
      children: [],
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
      label: "Поисковые запросы",
      href: "/search-queries",
      icon: <SearchSvg />,
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
        <Link href={"/"}>
          <MainImage src={"/assets/logo.png"} alt="Logo image" classContainer={styles.logoImage} />
        </Link>
      </div>
      <nav className={styles.navigateMenuNav}>
        <Suspense fallback={<div>Loading...</div>}>
          <NavigateMenu navigateList={navigateList} />
        </Suspense>
      </nav>
    </>
  );
};
