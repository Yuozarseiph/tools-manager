"use client";

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";

/** Portal positioning avoids clipping by tool cards, scroll areas and table containers. */
export function usePanelPopover(open: boolean, close: () => void, anchor: RefObject<HTMLElement | null>, options: { minWidth?: number; width?: number; maxHeight?: number } = {}) {
  const { minWidth = 0, width: fixedWidth, maxHeight = 380 } = options;
  const panel = useRef<HTMLDivElement>(null);
  const closeRef = useRef(close);
  useLayoutEffect(() => { closeRef.current = close; });
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, maxHeight: 320 });
  useLayoutEffect(() => {
    if (!open || !anchor.current) return;
    const place = () => {
      const rect = anchor.current!.getBoundingClientRect();
      const edge = 12, gap = 6, height = window.visualViewport?.height ?? window.innerHeight;
      const width = Math.min(fixedWidth ?? Math.max(rect.width, minWidth), window.innerWidth - edge * 2);
      const below = height - rect.bottom - gap - edge, above = rect.top - gap - edge;
      const up = below < 230 && above > below;
      const available = Math.max(80, Math.min(maxHeight, up ? above : below));
      const panelHeight = Math.min(panel.current?.scrollHeight ?? 300, available);
      const rtl = getComputedStyle(anchor.current!).direction === "rtl";
      const next = { width, left: Math.max(edge, Math.min(rtl ? rect.right - width : rect.left, window.innerWidth - width - edge)), top: up ? Math.max(edge, rect.top - gap - panelHeight) : rect.bottom + gap, maxHeight: available };
      setPosition(old => Object.keys(next).every(key => old[key as keyof typeof old] === next[key as keyof typeof next]) ? old : next);
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(anchor.current);
    if (panel.current) observer.observe(panel.current);
    const scroll = (event: Event) => { if (!(event.target instanceof Node) || !panel.current?.contains(event.target)) place(); };
    window.addEventListener("resize", place);
    window.addEventListener("scroll", scroll, true);
    window.visualViewport?.addEventListener("resize", place);
    return () => { observer.disconnect(); window.removeEventListener("resize", place); window.removeEventListener("scroll", scroll, true); window.visualViewport?.removeEventListener("resize", place); };
  }, [open, anchor, minWidth, fixedWidth, maxHeight]);
  useEffect(() => {
    if (!open) return;
    const outside = (event: Event) => {
      if (event.target instanceof Node && !anchor.current?.contains(event.target) && !panel.current?.contains(event.target)) closeRef.current();
    };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { event.preventDefault(); closeRef.current(); anchor.current?.focus(); } };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("focusin", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("focusin", outside); document.removeEventListener("keydown", escape); };
  }, [open, anchor]);
  return { panel, position };
}
