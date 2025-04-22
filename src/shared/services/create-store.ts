import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { devtools } from "zustand/middleware";
import { CONFIG_APP } from "../config/config";

/* eslint-disable @typescript-eslint/no-explicit-any */
const persistMiddleware = (initState: any, persistName?: string) => {
  if (!persistName) {
    return initState;
  }

  return persist(initState, {
    name: persistName,
    storage: createJSONStorage(() => localStorage),
  });
};

export const createStore = <T>({
  persistName,
  initState,
}: {
  persistName?: string;
  initState: T;
}) =>
  create<T>()(
    immer(
      CONFIG_APP.MODE === "development"
        ? devtools(persistMiddleware(() => initState, persistName))
        : persistMiddleware(() => initState, persistName),
    ),
  );
