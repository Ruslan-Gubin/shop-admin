export const resetNewStateValues = <T>(
  newState: Record<keyof T, { value: string; error: string } | string | null | number>,
) => {
  for (const key in newState) {
    if (
      newState[key] &&
      typeof newState[key] === "object" &&
      Object.hasOwn(newState[key], "value") &&
      Object.hasOwn(newState[key], "error")
    ) {
      newState[key].value = "";
      newState[key].error = "";
    }
  }
};
