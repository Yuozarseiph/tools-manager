declare module "dom-to-pptx" {
  export interface ExportOptions {
    fileName?: string;
    background?: string;
  }

  export function exportToPptx(
    selectorOrElements: string | Element | Element[],
    options?: ExportOptions
  ): Promise<void>;
}
