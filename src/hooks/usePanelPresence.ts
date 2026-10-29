"use client";

import { useEffect, useState } from "react";

/** Keep a closing layer for its short CSS exit; reopening cancels disposal. */
export function usePanelPresence(open: boolean) {
  const [retained, setRetained] = useState(open);
  if (open && !retained) setRetained(true);
  useEffect(() => {
    if (open) return;
    const reduced = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setRetained(false), reduced ? 0 : 140);
    return () => window.clearTimeout(timer);
  }, [open]);
  return {
    present: open || retained,
    attributes: {
      "data-panel-state": open ? "open" as const : "closing" as const,
      "aria-hidden": !open || undefined,
      inert: !open || undefined,
    },
  };
}
