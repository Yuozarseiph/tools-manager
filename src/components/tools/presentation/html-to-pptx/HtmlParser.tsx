// components/tools/presentation/html-to-pptx/HtmlParser.tsx

export type SlideType = "title" | "section" | "content" | "end";
export type BlockKind =
  | "heading"
  | "paragraph"
  | "listItem"
  | "table"
  | "image";
export type AspectRatio = "16:9" | "4:3" | "16:10";

export const ASPECT_RATIO_DIMENSIONS: Record<
  AspectRatio,
  { width: number; height: number }
> = {
  "16:9": { width: 10, height: 5.625 },
  "4:3": { width: 10, height: 7.5 },
  "16:10": { width: 10, height: 6.25 },
};

export interface CssSubset {
  color?: string;
  backgroundColor?: string;
  fontSize?: number;
  fontWeight?: number;
  fontStyle?: "normal" | "italic";
  textDecoration?: string;
  textAlign?: "left" | "right" | "center";
  marginTop?: number;
  marginBottom?: number;
}

export type TextRun = {
  text: string;
  options?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    color?: string;
    fontSize?: number;
    fontFace?: string;
  };
};

export interface Block {
  kind: BlockKind;
  text?: string;
  runs?: TextRun[];
  headingLevel?: number;
  listLevel?: number;
  listType?: "ul" | "ol";
  rows?: string[][];
  colSpans?: number[][];
  rowSpans?: number[][];
  css: CssSubset;
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface SlideModel {
  type: SlideType;
  blocks: Block[];
  title?: string;
}

export interface PresentationStructure {
  slides: SlideModel[];
  stats: {
    totalSlides: number;
    totalBlocks: number;
    headings: number;
    paragraphs: number;
    images: number;
    tables: number;
    lists: number;
  };
}

type DeclMap = Record<string, string>;

type Specificity = { a: number; b: number; c: number };
type CssRuleLite = {
  selector: string;
  decls: DeclMap;
  spec: Specificity;
  order: number;
};
type CssContext = {
  doc: Document;
  rules: CssRuleLite[];
  cache: WeakMap<Element, CssSubset>;
};

// ============ CSS Parsing ============
function stripCssComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

function parseCssDecls(style: string | null): DeclMap {
  if (!style) return {};
  const out: DeclMap = {};
  const parts = style.split(";");
  for (const part of parts) {
    const p = part.trim();
    if (!p) continue;
    const idx = p.indexOf(":");
    if (idx === -1) continue;
    const key = p.slice(0, idx).trim().toLowerCase();
    const val = p.slice(idx + 1).trim();
    if (!key || !val) continue;
    out[key] = val;
  }
  return out;
}

function calcSpecificity(selector: string): Specificity {
  const s = selector;
  const a = (s.match(/#[A-Za-z0-9_-]+/g) || []).length;
  const b =
    (s.match(/\.[A-Za-z0-9_-]+/g) || []).length +
    (s.match(/\[[^\]]+\]/g) || []).length +
    (s.match(/:(?!:)[A-Za-z0-9_-]+(\([^\)]*\))?/g) || []).length;
  const typeMatches = s.match(/(^|[\s>+~])([a-zA-Z][a-zA-Z0-9_-]*)/g) || [];
  let c = 0;
  for (const m of typeMatches) {
    const token = m.trim().replace(/^[>+~\s]+/, "");
    if (!token || token === "*" || token.startsWith(":")) continue;
    c += 1;
  }
  c += (s.match(/::[A-Za-z0-9_-]+/g) || []).length;
  return { a, b, c };
}

function compareSpecificity(x: Specificity, y: Specificity): number {
  if (x.a !== y.a) return x.a - y.a;
  if (x.b !== y.b) return x.b - y.b;
  return x.c - y.c;
}

function parseStyleTagCss(
  cssText: string,
): Array<{ selector: string; decls: DeclMap }> {
  const css = stripCssComments(cssText);
  const out: Array<{ selector: string; decls: DeclMap }> = [];
  const blocks = css.split("}");
  for (const block of blocks) {
    const b = block.trim();
    if (!b) continue;
    const idx = b.indexOf("{");
    if (idx === -1) continue;
    const rawSel = b.slice(0, idx).trim();
    const rawDecl = b.slice(idx + 1).trim();
    if (!rawSel || !rawDecl) continue;
    if (rawSel.startsWith("@")) continue;
    const decls = parseCssDecls(rawDecl);
    const selectors = rawSel
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    for (const sel of selectors) out.push({ selector: sel, decls });
  }
  return out;
}

function buildCssContext(doc: Document): CssContext {
  const styleEls = Array.from(doc.querySelectorAll("style"));
  const rules: CssRuleLite[] = [];
  let order = 0;
  for (const styleEl of styleEls) {
    const cssText = styleEl.textContent || "";
    const parsed = parseStyleTagCss(cssText);
    for (const r of parsed) {
      rules.push({
        selector: r.selector,
        decls: r.decls,
        spec: calcSpecificity(r.selector),
        order: order++,
      });
    }
  }
  return { doc, rules, cache: new WeakMap<Element, CssSubset>() };
}

// ============ CSS Resolution ============
function parseLengthPx(
  value: string | null | undefined,
  basePx: number,
): number | undefined {
  if (!value) return undefined;
  const v = value.trim().toLowerCase();
  const px = v.match(/^(-?\d+(\.\d+)?)px$/);
  if (px) return Number(px[1]);
  const pt = v.match(/^(-?\d+(\.\d+)?)pt$/);
  if (pt) return Number(pt[1]) * (4 / 3);
  const rem = v.match(/^(-?\d+(\.\d+)?)rem$/);
  if (rem) return Number(rem[1]) * 16;
  const em = v.match(/^(-?\d+(\.\d+)?)em$/);
  if (em) return Number(em[1]) * basePx;
  const pct = v.match(/^(-?\d+(\.\d+)?)%$/);
  if (pct) return (Number(pct[1]) / 100) * basePx;
  const num = parseFloat(v);
  return Number.isFinite(num) ? num : undefined;
}

function textAlignFromAny(
  v: string | null | undefined,
): CssSubset["textAlign"] {
  if (!v) return undefined;
  const x = v.trim().toLowerCase();
  if (x === "left" || x === "right" || x === "center") return x;
  return undefined;
}

function normaliseFontWeight(v?: string): number | undefined {
  if (!v) return undefined;
  const x = v.trim().toLowerCase();
  if (x === "normal") return 400;
  if (x === "bold") return 700;
  const n = parseInt(x, 10);
  return Number.isFinite(n) ? n : undefined;
}

function defaultCssForTag(tagName: string): CssSubset {
  const tag = tagName.toLowerCase();
  const base: CssSubset = {
    color: "#111111",
    fontSize: 16,
    fontWeight: 400,
    fontStyle: "normal",
    textAlign: "left",
    marginTop: 0,
    marginBottom: 0,
  };
  if (tag === "h1")
    return {
      ...base,
      fontSize: 38,
      fontWeight: 800,
      marginTop: 12,
      marginBottom: 8,
    };
  if (tag === "h2")
    return {
      ...base,
      fontSize: 30,
      fontWeight: 700,
      marginTop: 10,
      marginBottom: 6,
    };
  if (tag === "h3")
    return {
      ...base,
      fontSize: 24,
      fontWeight: 700,
      marginTop: 8,
      marginBottom: 6,
    };
  if (tag === "h4")
    return {
      ...base,
      fontSize: 20,
      fontWeight: 600,
      marginTop: 6,
      marginBottom: 4,
    };
  if (tag === "h5")
    return {
      ...base,
      fontSize: 18,
      fontWeight: 600,
      marginTop: 6,
      marginBottom: 4,
    };
  if (tag === "h6")
    return {
      ...base,
      fontSize: 16,
      fontWeight: 600,
      marginTop: 4,
      marginBottom: 4,
    };
  if (tag === "p") return { ...base, marginTop: 4, marginBottom: 4 };
  if (tag === "li") return { ...base, marginTop: 2, marginBottom: 2 };
  if (tag === "table") return { ...base, marginTop: 6, marginBottom: 6 };
  return base;
}

function pickCssSubsetFromDecls(decls: DeclMap, baseFontPx: number): CssSubset {
  const out: CssSubset = {};
  if (decls["color"]) out.color = decls["color"];
  if (decls["background-color"])
    out.backgroundColor = decls["background-color"];
  else if (decls["background"]) out.backgroundColor = decls["background"];
  if (decls["font-size"]) {
    const px = parseLengthPx(decls["font-size"], baseFontPx);
    if (typeof px === "number") out.fontSize = px;
  }
  if (decls["font-weight"]) {
    const fw = normaliseFontWeight(decls["font-weight"]);
    if (typeof fw === "number") out.fontWeight = fw;
  }
  if (decls["font-style"]) {
    const fs = decls["font-style"].trim().toLowerCase();
    if (fs === "italic") out.fontStyle = "italic";
    if (fs === "normal") out.fontStyle = "normal";
  }
  if (decls["text-decoration"]) out.textDecoration = decls["text-decoration"];
  if (decls["text-align"])
    out.textAlign = textAlignFromAny(decls["text-align"]);
  if (decls["margin-top"]) {
    const px = parseLengthPx(decls["margin-top"], baseFontPx);
    if (typeof px === "number") out.marginTop = px;
  }
  if (decls["margin-bottom"]) {
    const px = parseLengthPx(decls["margin-bottom"], baseFontPx);
    if (typeof px === "number") out.marginBottom = px;
  }
  return out;
}

function mergeCss(a: CssSubset, b: CssSubset): CssSubset {
  return {
    color: b.color ?? a.color,
    backgroundColor: b.backgroundColor ?? a.backgroundColor,
    fontSize: b.fontSize ?? a.fontSize,
    fontWeight: b.fontWeight ?? a.fontWeight,
    fontStyle: b.fontStyle ?? a.fontStyle,
    textDecoration: b.textDecoration ?? a.textDecoration,
    textAlign: b.textAlign ?? a.textAlign,
    marginTop: b.marginTop ?? a.marginTop,
    marginBottom: b.marginBottom ?? a.marginBottom,
  };
}

function isInheritableKey(k: keyof CssSubset): boolean {
  return (
    k === "color" ||
    k === "fontSize" ||
    k === "fontWeight" ||
    k === "fontStyle" ||
    k === "textAlign"
  );
}

function inheritCss(parent: CssSubset, local: CssSubset): CssSubset {
  const out: CssSubset = { ...local };
  (Object.keys(parent) as Array<keyof CssSubset>).forEach((k) => {
    if (!isInheritableKey(k)) return;
    const pv = parent[k];
    if (out[k] === undefined && pv !== undefined) (out as any)[k] = pv;
  });
  return out;
}

function resolveCssForElement(el: HTMLElement, ctx: CssContext): CssSubset {
  const cached = ctx.cache.get(el);
  if (cached) return cached;
  const tagDefault = defaultCssForTag(el.tagName);
  let parentResolved: CssSubset | undefined;
  if (el.parentElement)
    parentResolved = resolveCssForElement(el.parentElement, ctx);
  let resolved: CssSubset = parentResolved
    ? inheritCss(parentResolved, { ...tagDefault })
    : { ...tagDefault };
  const matches: CssRuleLite[] = [];
  for (const rule of ctx.rules) {
    try {
      if (el.matches(rule.selector)) matches.push(rule);
    } catch {}
  }
  if (matches.length) {
    matches.sort((r1, r2) => {
      const s = compareSpecificity(r1.spec, r2.spec);
      if (s !== 0) return s;
      return r1.order - r2.order;
    });
    const baseFontPx = resolved.fontSize ?? 16;
    for (const rule of matches) {
      const sub = pickCssSubsetFromDecls(rule.decls, baseFontPx);
      resolved = mergeCss(resolved, sub);
    }
  }
  const inlineDecls = parseCssDecls(el.getAttribute("style"));
  if (Object.keys(inlineDecls).length) {
    const baseFontPx = resolved.fontSize ?? 16;
    const sub = pickCssSubsetFromDecls(inlineDecls, baseFontPx);
    const alignAttr = el.getAttribute("align");
    if (!sub.textAlign && alignAttr)
      sub.textAlign = textAlignFromAny(alignAttr);
    resolved = mergeCss(resolved, sub);
  }
  ctx.cache.set(el, resolved);
  return resolved;
}

// ============ Slide Detection ============
function detectSlideTypeFromContent(
  el: HTMLElement,
  children: HTMLElement[],
): SlideType {
  const tag = el.tagName.toLowerCase();
  const cls = Array.from(el.classList);

  // Explicit classes
  if (cls.includes("title-slide") || cls.includes("pptx-title")) return "title";
  if (cls.includes("section-slide") || cls.includes("pptx-section"))
    return "section";
  if (cls.includes("end-slide") || cls.includes("pptx-end")) return "end";

  // Auto-detect: first h1 in document = title slide
  if (tag === "h1") return "title";

  // h2 with no other content = section
  if (
    tag === "h2" &&
    children.every(
      (c) =>
        /^h[2-6]$/.test(c.tagName.toLowerCase()) ||
        (c.tagName.toLowerCase() === "p" && !c.textContent?.trim()),
    )
  ) {
    return "section";
  }

  // hr = section break
  if (tag === "hr") return "section";

  return "content";
}

function shouldIgnore(node: HTMLElement): boolean {
  const cls = Array.from(node.classList);
  if (cls.includes("pptx-ignore") || cls.includes("no-export")) return true;
  const tag = node.tagName.toLowerCase();
  if (
    tag === "script" ||
    tag === "style" ||
    tag === "noscript" ||
    tag === "meta" ||
    tag === "link" ||
    tag === "head" ||
    tag === "title"
  )
    return true;
  return false;
}

function normaliseText(s: string): string {
  const x = s.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return x
    .replace(/[ \t\f\v]+/g, " ")
    .replace(/ *\n */g, "\n")
    .trim();
}

// ============ Text Extraction ============
type InlineFormat = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  colorHex?: string;
  fontSizePt?: number;
};

function mergeInlineFormat(
  base: InlineFormat,
  add: InlineFormat,
): InlineFormat {
  return {
    bold: add.bold ?? base.bold,
    italic: add.italic ?? base.italic,
    underline: add.underline ?? base.underline,
    colorHex: add.colorHex ?? base.colorHex,
    fontSizePt: add.fontSizePt ?? base.fontSizePt,
  };
}

function cssColorToHex(color?: string): string | undefined {
  if (!color) return undefined;
  const c = color.trim();
  const rgbMatch = c.match(/rgba?\s*\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  if (rgbMatch) {
    const [r, g, b] = rgbMatch
      .slice(1, 4)
      .map((n) => Math.max(0, Math.min(255, parseInt(n, 10))))
      .map((n) => n.toString(16).padStart(2, "0"));
    return `${r}${g}${b}`.toUpperCase();
  }
  if (c.startsWith("#")) {
    let hex = c.slice(1);
    if (hex.length === 3)
      hex = hex
        .split("")
        .map((x) => x + x)
        .join("");
    if (hex.length === 6) return hex.toUpperCase();
  }
  return undefined;
}

function formatFromElement(
  el: HTMLElement,
  resolvedCss: CssSubset,
): InlineFormat {
  const tag = el.tagName.toLowerCase();
  const out: InlineFormat = {};
  if (tag === "b" || tag === "strong") out.bold = true;
  if (tag === "i" || tag === "em") out.italic = true;
  if (tag === "u" || tag === "ins") out.underline = true;
  const cHex = cssColorToHex(resolvedCss.color);
  if (cHex) out.colorHex = cHex;
  if (
    typeof resolvedCss.fontWeight === "number" &&
    resolvedCss.fontWeight >= 600
  )
    out.bold = true;
  if (resolvedCss.fontStyle === "italic") out.italic = true;
  if (
    typeof resolvedCss.textDecoration === "string" &&
    resolvedCss.textDecoration.toLowerCase().includes("underline")
  )
    out.underline = true;
  if (typeof resolvedCss.fontSize === "number")
    out.fontSizePt = Math.round(resolvedCss.fontSize * 0.75);
  return out;
}

function pushRun(runs: TextRun[], text: string, fmt: InlineFormat) {
  if (!text) return;
  runs.push({
    text,
    options: {
      ...(fmt.bold ? { bold: true } : {}),
      ...(fmt.italic ? { italic: true } : {}),
      ...(fmt.underline ? { underline: true } : {}),
      ...(fmt.colorHex ? { color: fmt.colorHex } : {}),
      ...(fmt.fontSizePt ? { fontSize: fmt.fontSizePt } : {}),
    },
  });
}

function collectRunsFromNode(
  node: Node,
  runs: TextRun[],
  fmt: InlineFormat,
  ctx: CssContext,
) {
  if (node.nodeType === Node.TEXT_NODE) {
    pushRun(runs, (node.nodeValue ?? "").replace(/\s+/g, " "), fmt);
    return;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return;
  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();
  if (tag === "br") {
    pushRun(runs, "\n", fmt);
    return;
  }
  if (shouldIgnore(el)) return;
  const css = resolveCssForElement(el, ctx);
  const nextFmt = mergeInlineFormat(fmt, formatFromElement(el, css));
  const children = Array.from(el.childNodes);
  for (const ch of children) collectRunsFromNode(ch, runs, nextFmt, ctx);
  if (tag === "div" || tag === "section" || tag === "article")
    pushRun(runs, "\n", fmt);
}

// ============ Block Builders ============
function buildTextBlock(
  kind: "heading" | "paragraph",
  el: HTMLElement,
  headingLevel: number | undefined,
  ctx: CssContext,
): Block | null {
  const css = resolveCssForElement(el, ctx);
  const runs: TextRun[] = [];
  collectRunsFromNode(el, runs, {}, ctx);
  const rawText = normaliseText(runs.map((r) => r.text).join(""));
  if (!rawText) return null;
  return { kind, headingLevel, text: rawText, runs, css };
}

function buildListItemBlock(li: HTMLElement, ctx: CssContext): Block | null {
  const css = resolveCssForElement(li, ctx);
  const runs: TextRun[] = [];
  collectRunsFromNode(li, runs, {}, ctx);
  const raw = normaliseText(runs.map((r) => r.text).join(""));
  if (!raw) return null;
  let level = 0;
  let type: "ul" | "ol" = "ul";
  let p: HTMLElement | null = li.parentElement;
  while (p) {
    const t = p.tagName.toLowerCase();
    if (t === "ul" || t === "ol") {
      level++;
      type = t as any;
    }
    p = p.parentElement;
  }
  return {
    kind: "listItem",
    text: raw,
    listLevel: level || 1,
    listType: type,
    css,
  };
}

function buildImageBlock(img: HTMLImageElement, ctx: CssContext): Block | null {
  const src = img.getAttribute("src");
  if (!src) return null;
  const css = resolveCssForElement(img, ctx);
  let w = img.width || img.getAttribute("width");
  let h = img.height || img.getAttribute("height");
  return {
    kind: "image",
    src,
    alt: img.alt || "",
    width: w ? parseLengthPx(w.toString(), 16) : undefined,
    height: h ? parseLengthPx(h.toString(), 16) : undefined,
    css,
  };
}

function buildTableBlock(
  table: HTMLTableElement,
  ctx: CssContext,
): Block | null {
  const css = resolveCssForElement(table, ctx);
  const rows: string[][] = [];
  const colSpans: number[][] = [];
  const rowSpans: number[][] = [];
  const trs = Array.from(table.querySelectorAll("tr"));
  if (!trs.length) return null;
  for (const tr of trs) {
    const outRow: string[] = [];
    const csRow: number[] = [];
    const rsRow: number[] = [];
    const cells = Array.from(tr.querySelectorAll("th,td"));
    for (const cell of cells) {
      const txt = normaliseText(cell.textContent ?? "");
      const colspan = Math.max(1, (cell as HTMLTableCellElement).colSpan || 1);
      const rowspan = Math.max(1, (cell as HTMLTableCellElement).rowSpan || 1);
      outRow.push(txt);
      csRow.push(colspan);
      rsRow.push(rowspan);
      for (let i = 1; i < colspan; i++) {
        outRow.push("");
        csRow.push(0);
        rsRow.push(0);
      }
    }
    rows.push(outRow);
    colSpans.push(csRow);
    rowSpans.push(rsRow);
  }
  if (!rows.length) return null;
  const maxCols = Math.max(...rows.map((r) => r.length));
  const norm = rows.map((r) =>
    r.length < maxCols ? r.concat(Array(maxCols - r.length).fill("")) : r,
  );
  return { kind: "table", rows: norm, colSpans, rowSpans, css };
}

// ============ Smart Block Collection ============
function collectBlocks(
  root: HTMLElement,
  slide: SlideModel,
  ctx: CssContext,
): void {
  const walk = (node: HTMLElement) => {
    if (shouldIgnore(node)) return;
    const tag = node.tagName.toLowerCase();
    if (tag === "table") {
      const b = buildTableBlock(node as HTMLTableElement, ctx);
      if (b) slide.blocks.push(b);
      return;
    }
    if (tag === "img") {
      const b = buildImageBlock(node as HTMLImageElement, ctx);
      if (b) slide.blocks.push(b);
      return;
    }
    if (/^h[1-6]$/.test(tag)) {
      const b = buildTextBlock("heading", node, Number(tag.slice(1)), ctx);
      if (b) {
        slide.blocks.push(b);
        if (!slide.title && (tag === "h1" || tag === "h2"))
          slide.title = b.text;
      }
      return;
    }
    if (tag === "p") {
      const b = buildTextBlock("paragraph", node, undefined, ctx);
      if (b) slide.blocks.push(b);
      return;
    }
    if (tag === "li") {
      const b = buildListItemBlock(node, ctx);
      if (b) slide.blocks.push(b);
      return;
    }
    const children = Array.from(node.children) as HTMLElement[];
    for (const child of children) walk(child);
  };
  walk(root);
}

// ============ Main Parser - Smart Auto Mode ============
export function parseHtmlToSlides(html: string): SlideModel[] {
  if (typeof window === "undefined") return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const root = (doc.body || doc.documentElement) as HTMLElement | null;
  if (!root) return [];
  const ctx = buildCssContext(doc);
  const slides: SlideModel[] = [];

  // Check for explicit slides first
  const explicitSlides = Array.from(
    root.querySelectorAll<HTMLElement>(".slide, [data-slide]"),
  );
  if (explicitSlides.length > 0) {
    for (const el of explicitSlides) {
      const type =
        (el.getAttribute("data-slide-type") as SlideType) ||
        (el.classList.contains("title-slide")
          ? "title"
          : el.classList.contains("section-slide")
            ? "section"
            : el.classList.contains("end-slide")
              ? "end"
              : "content");
      const slide: SlideModel = { type, blocks: [] };
      collectBlocks(el, slide, ctx);
      if (slide.blocks.length) slides.push(slide);
    }
    return slides;
  }

  // Smart auto-detection
  const children = Array.from(root.children) as HTMLElement[];
  let currentSlide: SlideModel | null = null;
  const MAX_BLOCKS_PER_SLIDE = 8;
  const MAX_TEXT_LENGTH_PER_SLIDE = 2000;

  const pushSlide = () => {
    if (currentSlide && currentSlide.blocks.length) {
      slides.push(currentSlide);
    }
    currentSlide = null;
  };

  const shouldBreakBefore = (el: HTMLElement): boolean => {
    const tag = el.tagName.toLowerCase();
    // Always break before h1 and h2
    if (tag === "h1" || tag === "h2") return true;
    // Break before h3 if current slide has enough content
    if (tag === "h3" && currentSlide && currentSlide.blocks.length >= 3)
      return true;
    // hr always breaks
    if (tag === "hr") return true;
    // section/article always breaks
    if (tag === "section" || tag === "article") return true;
    return false;
  };

  const isSlideTooFull = (slide: SlideModel): boolean => {
    if (slide.blocks.length >= MAX_BLOCKS_PER_SLIDE) return true;
    const totalText = slide.blocks.reduce(
      (sum, b) => sum + (b.text?.length || 0),
      0,
    );
    if (totalText >= MAX_TEXT_LENGTH_PER_SLIDE) return true;
    // If we have a heading and more than 5 blocks, split
    const hasHeading = slide.blocks.some((b) => b.kind === "heading");
    if (hasHeading && slide.blocks.length >= 6) return true;
    return false;
  };

  for (const child of children) {
    if (shouldIgnore(child)) continue;

    if (shouldBreakBefore(child)) {
      pushSlide();
      const type = detectSlideTypeFromContent(
        child,
        Array.from(child.children) as HTMLElement[],
      );
      currentSlide = { type, blocks: [] };
    }

    if (!currentSlide) {
      currentSlide = { type: "content", blocks: [] };
    }

    // Collect blocks from this child into a temp slide to check
    const tempSlide: SlideModel = { type: currentSlide.type, blocks: [] };
    collectBlocks(child, tempSlide, ctx);

    // If adding these blocks would make the slide too full, start a new slide
    if (isSlideTooFull(currentSlide) && tempSlide.blocks.length > 0) {
      pushSlide();
      currentSlide = { type: "content", blocks: [] };
    }

    // Actually add blocks
    collectBlocks(child, currentSlide, ctx);
  }

  pushSlide();

  // Post-process: ensure first slide is title if it starts with h1
  if (slides.length > 0) {
    const firstSlide = slides[0];
    const firstBlock = firstSlide.blocks[0];
    if (
      firstBlock &&
      firstBlock.kind === "heading" &&
      firstBlock.headingLevel === 1
    ) {
      firstSlide.type = "title";
    }
    // Last slide: if it's just a simple content, could be "end"
    const lastSlide = slides[slides.length - 1];
    if (lastSlide.blocks.length <= 2 && lastSlide.type === "content") {
      const hasEndIndicator = lastSlide.blocks.some(
        (b) =>
          b.text?.toLowerCase().includes("thank") ||
          b.text?.toLowerCase().includes("پایان") ||
          b.text?.toLowerCase().includes("متشکر") ||
          b.text?.toLowerCase().includes("سپاس"),
      );
      if (hasEndIndicator) lastSlide.type = "end";
    }
  }

  return slides;
}

export function getPresentationStats(
  slides: SlideModel[],
): PresentationStructure["stats"] {
  const stats = {
    totalSlides: slides.length,
    totalBlocks: 0,
    headings: 0,
    paragraphs: 0,
    images: 0,
    tables: 0,
    lists: 0,
  };
  for (const slide of slides) {
    for (const block of slide.blocks) {
      stats.totalBlocks++;
      if (block.kind === "heading") stats.headings++;
      if (block.kind === "paragraph") stats.paragraphs++;
      if (block.kind === "image") stats.images++;
      if (block.kind === "table") stats.tables++;
      if (block.kind === "listItem") stats.lists++;
    }
  }
  return stats;
}
