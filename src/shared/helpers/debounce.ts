export const debounce = <T extends (...args: unknown[]) => void>(
  func: T,
  timeout: number = 400,
) => {
  let timer: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, timeout);
  };
};
