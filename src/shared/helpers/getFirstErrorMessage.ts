export const getFirstErrorMessage = (errors: Record<string, string>, message: string) => {
  let errorMessage = message || "";

  for (const key in errors) {
    if (errors[key].length > 0) {
      errorMessage = errors[key];
      break;
    }
  }

  return errorMessage;
};
