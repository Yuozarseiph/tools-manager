import type { ReactNode } from "react";

export type PageContainerWidth =
  | "narrow"
  | "content"
  | "wide"
  | "full";

export type PageContainerSpacing =
  | "none"
  | "compact"
  | "default"
  | "relaxed";

export type PageContainerGutter =
  | "none"
  | "compact"
  | "default";

type PageContainerElement = "main" | "div" | "section";

interface PageContainerProps {
  children: ReactNode;

  /**
   * Semantic root element.
   * Use "main" for normal standalone pages.
   */
  as?: PageContainerElement;

  /**
   * Maximum content width.
   *
   * narrow  -> policy / article / focused content
   * content -> docs / changelog / forms
   * wide    -> home / download / most tool pages
   * full    -> editors and workspace-style tools
   */
  width?: PageContainerWidth;

  /**
   * Vertical page spacing.
   */
  spacing?: PageContainerSpacing;

  /**
   * Horizontal page gutter.
   */
  gutter?: PageContainerGutter;

  /**
   * Adds the global page background and text color.
   */
  withBackground?: boolean;

  /**
   * Adds min-h-screen to the outer page root.
   */
  fullHeight?: boolean;

  /**
   * Extra classes for the outer root.
   */
  className?: string;

  /**
   * Extra classes for the centered inner container.
   */
  innerClassName?: string;

  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

const WIDTH_CLASSES: Record<PageContainerWidth, string> = {
  narrow: "max-w-4xl",
  content: "max-w-6xl",
  wide: "max-w-7xl",
  full: "max-w-none",
};

const SPACING_CLASSES: Record<PageContainerSpacing, string> = {
  none: "",
  compact: "pt-4 pb-24 sm:pt-6 lg:pb-16",
  default: "pt-6 pb-28 sm:pt-8 lg:pt-10 lg:pb-20",
  relaxed: "pt-8 pb-28 sm:pt-10 lg:pt-12 lg:pb-24",
};

const GUTTER_CLASSES: Record<PageContainerGutter, string> = {
  none: "",
  compact: "px-3 sm:px-4 lg:px-6",
  default: "px-4 sm:px-6 lg:px-8",
};

function classes(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export default function PageContainer({
  children,
  as: Root = "main",
  width = "wide",
  spacing = "default",
  gutter = "default",
  withBackground = true,
  fullHeight = true,
  className,
  innerClassName,
  id,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: PageContainerProps) {
  return (
    <Root
      id={id}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={classes(
        "relative isolate",
        fullHeight && "min-h-screen",
        withBackground &&
        "bg-[var(--app-bg)] text-[var(--app-text)]",
        className,
      )}
    >
      <div
        className={classes(
          "mx-auto w-full",
          "[&>main]:min-w-0",
          WIDTH_CLASSES[width],
          SPACING_CLASSES[spacing],
          GUTTER_CLASSES[gutter],
          innerClassName,
        )}
      >
        {children}
      </div>
    </Root>
  );
}
