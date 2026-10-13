"use client";
import { useEffect } from "react";
/** Provides focus management for existing tool and settings dialogs. */
export default function Accessibility() {
  useEffect(() => {
    const stack: { dialog: HTMLElement; previous: HTMLElement | null }[] = [];
    const focusable = (dialog: HTMLElement) => [...dialog.querySelectorAll<HTMLElement>(
      'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
    )].filter(element => element.getClientRects().length > 0 && !element.closest('[aria-hidden="true"], [inert]'));
    const sync = () => {
      const open = [...document.querySelectorAll<HTMLElement>('[role="dialog"][aria-modal="true"]')].filter(element => element.getClientRects().length > 0);
      const current = stack.at(-1);
      if (current && !open.includes(current.dialog)) {
        stack.pop(); if (current.previous?.isConnected) current.previous.focus(); sync(); return;
      }
      for (const dialog of open.filter(dialog => !stack.some(entry => entry.dialog === dialog))) {
        stack.push({ dialog, previous: document.activeElement instanceof HTMLElement ? document.activeElement : null });
        dialog.tabIndex = -1; (focusable(dialog)[0] ?? dialog).focus();
      }
    };
    const onKey = (event: KeyboardEvent) => {
      const current = stack.at(-1); if (!current) return;
      if (event.key === "Tab") {
        const items = focusable(current.dialog); const first = items[0] ?? current.dialog; const last = items.at(-1) ?? current.dialog;
        if (event.shiftKey && (document.activeElement === first || !current.dialog.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && (document.activeElement === last || !current.dialog.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
      }
      if (event.key === "Escape") {
        const close = current.dialog.querySelector<HTMLButtonElement>('button[aria-label="Close"], button[aria-label="بستن"]');
        if (close) { event.preventDefault(); event.stopImmediatePropagation(); close.click(); }
      }
    };
    const onFocus = (event: FocusEvent) => {
      const current = stack.at(-1);
      if (current && event.target instanceof Node && !current.dialog.contains(event.target)) (focusable(current.dialog)[0] ?? current.dialog).focus();
    };
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["aria-modal", "hidden"] });
    sync(); document.addEventListener("keydown", onKey, true); document.addEventListener("focusin", onFocus);
    return () => { observer.disconnect(); document.removeEventListener("keydown", onKey, true); document.removeEventListener("focusin", onFocus); };
  }, []);
  return null;
}
