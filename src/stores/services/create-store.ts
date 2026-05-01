import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

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

export const createStore = <T>(initState: T, persistName?: string) =>
  create<T>()(
    immer(
      process.env.NODE_ENV === "development"
        ? devtools(persistMiddleware(() => initState, persistName))
        : persistMiddleware(() => initState, persistName),
    ),
  );
