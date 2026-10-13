"use client";

import { useLayoutEffect, useRef } from "react";

/** Keep anchored menus inside the viewport in both writing directions. */
export function useViewportMenu(open: boolean) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const panel = ref.current;
    if (!open || !panel) return;

    const place = () => {
      const anchor = panel.parentElement?.getBoundingClientRect();
      if (anchor) {
        const clearance = window.innerWidth < 768 ? 96 : 16;
        const below = window.innerHeight - anchor.bottom - 8 - clearance;
        const above = anchor.top - 8 - 80;
        const upward = below < 200 && above > below;
        panel.style.top = upward ? "auto" : "100%";
        panel.style.bottom = upward ? "calc(100% + 8px)" : "auto";
        panel.style.marginTop = upward ? "0" : "8px";
        panel.style.maxHeight = `${Math.max(44, upward ? above : below)}px`;
        panel.style.overflowY = "auto";
      }
      panel.style.translate = "none";
      const { left, right } = panel.getBoundingClientRect();
      const edge = 16;
      const width = document.documentElement.clientWidth;
      const shift = left < edge ? edge - left : right > width - edge ? width - edge - right : 0;
      panel.style.translate = `${shift}px 0`;
    };

    place();
    const observer = new ResizeObserver(place);
    observer.observe(panel);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  return ref;
}
