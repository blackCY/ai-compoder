import { useEffect, RefObject } from "react";

/**
 * 检测点击是否发生在元素外部
 * @param ref - 要检测的元素的 ref
 * @param handler - 点击外部时的回调函数
 * @param isActive - 是否激活检测，默认为 true
 */
export function useOnClickOutside(
  ref: RefObject<HTMLElement | null>,
  handler: () => void,
  isActive: boolean = true
) {
  useEffect(() => {
    if (!isActive) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref.current;
      if (!el || el.contains(event.target as Node)) return;

      handler();
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler, isActive]);
}
