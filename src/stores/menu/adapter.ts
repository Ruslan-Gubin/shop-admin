import { menuStore } from "./store";

export class MenuAdapter {
  public toggleMenu(value: boolean) {
    return menuStore.setState({ isActiveMenu: value });
  }
}

export const menuAdapter = new MenuAdapter();
