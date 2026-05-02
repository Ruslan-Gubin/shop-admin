import { type RefObject, useEffect, useRef } from "react";

type UseIntersectionObserverOptions = {
  target: RefObject<HTMLElement | null> | null;
  onIntersect?: () => void;
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  disabled?: boolean;
};

export const useIntersectionObserver = ({
  target,
  onIntersect,
  threshold = 1,
  root = null,
  rootMargin = "0%",
  disabled = false,
}: UseIntersectionObserverOptions) => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!target?.current || typeof window === "undefined") return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !disabled && onIntersect) {
          onIntersect();
        }
      },
      {
        threshold,
        root,
        rootMargin,
      },
    );

    observerRef.current.observe(target.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [target, onIntersect, threshold, root, rootMargin, disabled]);

  const disconnect = () => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  };

  const observe = (element: Element | null) => {
    if (element && observerRef.current && !disabled) {
      observerRef.current.observe(element);
    }
  };

  return { disconnect, observe };
};
