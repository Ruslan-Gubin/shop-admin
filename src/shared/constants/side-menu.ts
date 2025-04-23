import { CreateProductSvg } from "../svg/side-menu/CreateProductSvg";
import { RegisterSvg } from "../svg/side-menu/RegisterSvg";
import { StarsMenuSvg } from "../svg/side-menu/StarsMenuSvg";
import type { ComponentType, SVGProps } from "react";

export type SvgIconProps = ComponentType<SVGProps<SVGSVGElement>>;

export type NavsMenuItemType = {
  id: number;
  title: string;
  href: string;
  svg: SvgIconProps;
  active: string[];
};

export const personalAccountNavs: NavsMenuItemType[] = [
  {
    id: 1,
    title: "Список товаров",
    href: "/",
    svg: RegisterSvg,
    active: ["/"],
  },
  {
    id: 2,
    title: "Добавить товар",
    href: "product/create",
    svg: CreateProductSvg,
    active: ["/product/create"],
  },
  // {
  //   id: 3,
  //   title: "Реестр документов ВКК",
  //   href: "/",
  //   svg: RegisterSvg,
  //   active: [],
  // },
  // {
  //   id: 4,
  //   title: "Календарь ВКК",
  //   href: "/",
  //   svg: CalendarSvg,
  //   active: [],
  // },
  // {
  //   id: 5,
  //   title: "Тарифы и оплата",
  //   href: "/",
  //   svg: PaymentsSvg,
  //   active: ["/any"],
  // },
];

export const workspaceNavs: NavsMenuItemType[] = [
  {
    id: 1,
    title: "Руководитель МО",
    href: "/",
    svg: StarsMenuSvg,
    active: ["/any"],
  },
  {
    id: 2,
    title: "Ответственное лицо",
    href: "/",
    svg: StarsMenuSvg,
    active: ["/any"],
  },
  {
    id: 3,
    title: "Уполномоченное лицо",
    href: "/",
    svg: StarsMenuSvg,
    active: ["/any"],
  },
  {
    id: 4,
    title: "Председатель ВК",
    href: "/",
    svg: StarsMenuSvg,
    active: [],
  },
  {
    id: 5,
    title: "Секретарь ВК",
    href: "/",
    svg: StarsMenuSvg,
    active: [],
  },
  { id: 6, title: "Член ВК", href: "/", svg: StarsMenuSvg, active: ["/any"] },
  {
    id: 7,
    title: "Администратор клиники",
    href: "/",
    svg: StarsMenuSvg,
    active: [],
  },
];
