"use client";
import { useEffect, useEffectEvent, useState } from "react";
import { debounce } from "../helpers/debounce";

export const useWindowSize = (ms: number = 300) => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  const debounceResizeEvent = useEffectEvent(() => {
    if (window.innerWidth !== windowSize.width || window.innerHeight !== windowSize.height) {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const debounceResize = debounce(debounceResizeEvent, ms);

    window.addEventListener("resize", debounceResize);

    return () => {
      window.removeEventListener("resize", debounceResize);
    };
  }, [ms]);

  return {
    windowSize,
    isMobile: windowSize.width <= 500,
  };
};
