import type { ReactNode } from "react";

/** Intrinsic-height transition; hidden content stays out of keyboard navigation. */
export default function PanelDisclosure({ open, children, className = "", id }: { open: boolean; children: ReactNode; className?: string; id?: string }) {
  return <div id={id} className="panel-disclosure" data-expanded={open} aria-hidden={!open || undefined} inert={!open || undefined}>
    <div className="panel-disclosure-clip"><div className={className}>{children}</div></div>
  </div>;
}
