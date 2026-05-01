import { createStore } from "../services/create-store";
import type { MenuInitState } from "./types";

export const menuStore = createStore<MenuInitState>({
  isActiveMenu: false,
});

