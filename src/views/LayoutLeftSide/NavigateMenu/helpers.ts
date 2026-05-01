import type { NavigateListItem } from "../LayoutLeftSide";

export const findRecursiveActiveHref = (navigateList: NavigateListItem[], pathname: string) => {
  for (let i = 0; i < navigateList.length; i++) {
    const element = navigateList[i];

    if (element.href === pathname) {
      return true;
    }

    if (element.children.length > 0) {
      const isHasActiveHref = findRecursiveActiveHref(element.children, pathname);
      if (isHasActiveHref) {
        return true;
      }
    }
  }

  return false;
};

export const getInitSelect = (navigateList: NavigateListItem[], pathname: string): string => {
  let activeHref = "";

  for (let i = 0; i < navigateList.length; i++) {
    const element = navigateList[i];

    if (element.href === pathname && element.children.length > 0) {
      activeHref = element.href;
      break;
    }

    if (element.children.length > 0) {
      const findActiveHref = findRecursiveActiveHref(element.children, pathname);

      if (findActiveHref) {
        activeHref = element.href;
        break;
      }
    }
  }

  return activeHref;
};
