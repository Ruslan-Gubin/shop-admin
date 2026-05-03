import { useEffect, useEffectEvent, useState } from "react";
import { debounce } from "../helpers/debounce";

export const useWindowSize = (ms: number = 300) => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" && window.innerWidth ? window.innerWidth : 0,
    height: typeof window !== "undefined" && window.innerHeight ? window.innerHeight : 0,
  });
  const [isMounted, setMounted] = useState<boolean>(false);

  const debounceResizeEvent = useEffectEvent(() => {
    const isClient = typeof window !== "undefined";

    if (
      isClient &&
      (window.innerWidth !== windowSize.width || window.innerHeight !== windowSize.height)
    ) {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
  });

  const checkIsMounted = useEffectEvent(() => {
    if (!isMounted) {
      setMounted(true);
    }
  });

  useEffect(() => {
    const isClient = typeof window !== "undefined";
    if (!isClient) return;

    const debounceResize = debounce(debounceResizeEvent, ms);
    checkIsMounted();

    window.addEventListener("resize", debounceResize);

    return () => {
      window.removeEventListener("resize", debounceResize);
    };
  }, [ms]);

  return {
    windowSize,
    isMobile: windowSize.width <= 880,
    isMounted,
  };
};
