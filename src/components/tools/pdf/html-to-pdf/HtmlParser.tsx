// components/tools/HtmlToPptx/HtmlParser.tsx

export type SlideType = "title" | "section" | "content" | "end";

export type BlockKind = "heading" | "paragraph" | "listItem" | "table";

export interface CssSubset {
  color?: string;
  backgroundColor?: string;
  fontSize?: number; // px
  fontWeight?: number;
  textAlign?: "left" | "right" | "center";
  marginTop?: number;
  marginBottom?: number;
}

export interface Block {
  kind: BlockKind;
  text?: string;              // برای heading/paragraph/listItem
  headingLevel?: number;      // h1..h6
  listLevel?: number;         // برای لیست
  rows?: string[][];          // برای table
  css: CssSubset;
}

export interface SlideModel {
  type: SlideType;
  blocks: Block[];
}

// --- helpers ---

function parsePx(value: string | null): number | undefined {
  if (!value) return undefined;
  const num = parseFloat(value);
  return Number.isFinite(num) ? num : undefined;
}

function extractCss(el: HTMLElement): CssSubset {
  if (typeof window === "undefined" || !window.getComputedStyle) {
    return {};
  }
  const s = window.getComputedStyle(el);
  const css: CssSubset = {
    color: s.color || undefined,
    backgroundColor: s.backgroundColor || undefined,
    fontSize: parsePx(s.fontSize),
    fontWeight: parseInt(s.fontWeight || "", 10) || undefined,
    textAlign: (s.textAlign as CssSubset["textAlign"]) || undefined,
    marginTop: parsePx(s.marginTop),
    marginBottom: parsePx(s.marginBottom),
  };
  return css;
}

function detectSlideType(node: HTMLElement): SlideType {
  const cls = Array.from(node.classList);
  if (cls.includes("title-slide")) return "title";
  if (cls.includes("section-break") || cls.includes("section-slide"))
    return "section";
  if (cls.includes("end-slide")) return "end";
  return "content";
}

function getListLevel(el: HTMLElement): number {
  let level = 0;
  let parent: HTMLElement | null = el.parentElement;
  while (parent) {
    if (parent.tagName === "UL" || parent.tagName === "OL") {
      level += 1;
    }
    parent = parent.parentElement;
  }
  return level;
}

/**
 * ورودی: HTML خام (فقط body/fragment)
 * خروجی: آرایه‌ای از SlideModel برای رندر با PptxGenJS
 */
export function parseHtmlToSlides(html: string): SlideModel[] {
  if (typeof window === "undefined") return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(
    `<div id="html-root">${html}</div>`,
    "text/html"
  );
  const root =
    (doc.getElementById("html-root") as HTMLElement | null) ??
    (doc.body as HTMLElement);

  let slideNodes = root.querySelectorAll<HTMLElement>(".slide");
  if (!slideNodes.length) {
    slideNodes = root.querySelectorAll<HTMLElement>("section[data-slide]");
  }
  const slidesDom: HTMLElement[] =
    slideNodes.length > 0 ? Array.from(slideNodes) : [root];

  const slides: SlideModel[] = [];

  for (const slideEl of slidesDom) {
    const type = detectSlideType(slideEl);
    const blocks: Block[] = [];

    // ترتیب DOM: تیتر / متن / لیست / جدول
    const nodes = slideEl.querySelectorAll<HTMLElement>(
      "h1,h2,h3,h4,h5,h6,p,li,table"
    );

    nodes.forEach((el) => {
      const tag = el.tagName.toLowerCase();

      // جدول
      if (tag === "table") {
        const rows: string[][] = [];
        el.querySelectorAll<HTMLTableRowElement>("tr").forEach((tr) => {
          const cells: string[] = [];
          tr.querySelectorAll<HTMLElement>("th,td").forEach((cell) => {
            const txt = (cell.textContent || "").trim();
            if (txt) cells.push(txt);
          });
          if (cells.length) rows.push(cells);
        });

        if (rows.length) {
          blocks.push({
            kind: "table",
            rows,
            css: extractCss(el),
          });
        }
        return;
      }

      // بقیه تگ‌ها متنی
      const text = (el.textContent || "").trim();
      if (!text) return;

      const css = extractCss(el);

      if (tag.startsWith("h")) {
        const level = parseInt(tag[1] || "1", 10);
        blocks.push({
          kind: "heading",
          text,
          headingLevel: Number.isFinite(level) ? level : 1,
          css,
        });
      } else if (tag === "li") {
        blocks.push({
          kind: "listItem",
          text,
          listLevel: getListLevel(el),
          css,
        });
      } else if (tag === "p") {
        blocks.push({
          kind: "paragraph",
          text,
          css,
        });
      }
    });

    if (blocks.length > 0) {
      slides.push({ type, blocks });
    }
  }

  return slides;
}
