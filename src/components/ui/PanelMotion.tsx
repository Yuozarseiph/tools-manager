"use client";
import { MotionConfig, motion, useIsPresent, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

export function PanelMotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user" transition={{ duration: .18, ease: [.2, .7, .2, 1] }}>{children}</MotionConfig>;
}

/** AnimatePresence retains this existing dialog during its exit without extra DOM. */
export function AnimatedDialog(props: HTMLMotionProps<"div">) {
  const present = useIsPresent(), reduced = useReducedMotion();
  return <motion.div {...props} aria-hidden={!present || undefined} inert={!present || undefined}
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    transition={{ duration: reduced ? 0 : present ? .18 : .14, ease: [.2, .7, .2, 1] }} />;
}
