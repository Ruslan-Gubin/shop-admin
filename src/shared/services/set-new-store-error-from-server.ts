import type { ErrorItem } from "../types/response";

export const setNewStoreErrorFromServer = <T>(
  errors: ErrorItem[],
  newState: Record<keyof T, { value: string; error: string } | string | number | null>,
) => {
  for (const error of errors) {
    const key = error.key as keyof T;
    if (
      newState[key] &&
      typeof newState[key] === "object" &&
      Object.hasOwn(newState[key], "value") &&
      Object.hasOwn(newState[key], "error")
    ) {
      newState[key].error = error.message;
    }
  }
};

export const setErrorFromServer = <T>(
  errors: ErrorItem[],
  updateErrors: Record<keyof T, string>,
) => {
  for (const error of errors) {
    const key = error.key as keyof T;
    if (Object.hasOwn(updateErrors, key)) {
      updateErrors[key] = error.message;
    }
  }
};
