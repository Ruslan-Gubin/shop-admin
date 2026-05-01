import { useCallback, useEffect, useRef } from "react";

export const useDebounce = () => {
  const timer = useRef<ReturnType<typeof setTimeout>>(null);

  const run = useCallback((cb: () => void, delay?: number) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(cb, delay ?? 500);
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return run;
};
