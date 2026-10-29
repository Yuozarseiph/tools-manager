import type PptxGenJS from "pptxgenjs";
import { ASPECT_RATIO_DIMENSIONS, type AspectRatio, type Block, type SlideModel, type TextRun } from "./HtmlParser";
import { downloadBlob } from "@/lib/transfer";
type Slide = ReturnType<PptxGenJS["addSlide"]>;
export type ExportSettings = {
  aspectRatio: AspectRatio; fontFace: string; fontSize: number; lineSpacing: number;
  direction: "auto" | "rtl" | "ltr"; margin: number; preserveStyles: boolean;
  includeImages: boolean; allowRemoteImages: boolean; showNumbers: boolean; footer: string;
  title: string; author: string; notes: boolean;
  theme: { primary: string; accent: string; background: string; textOnPrimary: string; textOnContent: string; tableHeaderBg: string; tableHeaderText: string; tableRowEven: string; tableRowOdd: string; tableBorder: string; footerColor: string };
};
export function colorHex(value?: string) {
  if (!value) return undefined;
  const canvas = document.createElement("canvas"); const context = canvas.getContext("2d");
  if (!context) return undefined;
  context.fillStyle = "#000000"; context.fillStyle = value;
  const color = context.fillStyle;
  return /^#[a-f0-9]{6}$/i.test(color) ? color.slice(1).toUpperCase() : undefined;
}
function rtl(text: string, direction: ExportSettings["direction"]) { return direction === "rtl" || direction === "auto" && /[\u0600-\u06ff]/.test(text); }
function splitRuns(runs: TextRun[], start: number, end: number): TextRun[] {
  let offset = 0;
  return runs.flatMap(run => { const from = Math.max(0, start - offset), to = Math.min(run.text.length, end - offset); offset += run.text.length; return to > from ? [{ ...run, text: run.text.slice(from, to) }] : []; });
}
function lineRanges(text: string, width: number, context: CanvasRenderingContext2D): [number, number][] {
  const ranges: [number, number][] = []; let start = 0, cursor = 0, lastSpace = -1, measured = 0;
  for (const character of text) {
    const end = cursor + character.length;
    if (character === "\n") { ranges.push([start, end]); start = end; measured = 0; lastSpace = -1; }
    else {
      const size = context.measureText(character).width;
      if (measured + size > width && cursor > start) {
        const split = lastSpace > start ? lastSpace : cursor;
        ranges.push([start, split]); start = split;
        measured = context.measureText(text.slice(split, cursor)).width; lastSpace = -1;
      }
      measured += size; if (/\s/.test(character)) lastSpace = end;
    }
    cursor = end;
  }
  if (start < text.length) ranges.push([start, text.length]);
  return ranges.length ? ranges : [[0, 0]];
}
async function imageData(src: string, remote: boolean, signal: AbortSignal) {
  if (/^data:image\/(?:png|jpe?g|webp|gif|svg\+xml);/i.test(src)) return src;
  if (!remote || !/^https?:\/\//i.test(src)) throw new Error("REMOTE_IMAGE_DISABLED");
  const blob = await downloadBlob(src, "PowerPoint · image", signal);
  if (!blob.type.startsWith("image/") || blob.size > 20 * 1024 * 1024) throw new Error("INVALID_IMAGE");
  return new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(reader.error); reader.readAsDataURL(blob); });
}
async function imageSize(data: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => { const image = new Image(); const timer = setTimeout(() => reject(new Error("IMAGE_TIMEOUT")), 15000); image.onload = () => { clearTimeout(timer); resolve({ width: image.naturalWidth, height: image.naturalHeight }); }; image.onerror = () => { clearTimeout(timer); reject(new Error("INVALID_IMAGE")); }; image.src = data; });
}
export async function exportEditable(models: SlideModel[], settings: ExportSettings, signal: AbortSignal, progress: (done: number, total: number) => void) {
  const { default: Pptx } = await import("pptxgenjs"); const pptx = new Pptx();
  const dimensions = ASPECT_RATIO_DIMENSIONS[settings.aspectRatio]; const W = dimensions.width, H = dimensions.height, M = settings.margin, bottom = H - M - .35;
  pptx.defineLayout({ name: "QodeForge", width: W, height: H }); pptx.layout = "QodeForge";
  pptx.title = settings.title; pptx.author = settings.author; pptx.subject = "HTML to editable PowerPoint"; pptx.theme = { headFontFace: settings.fontFace, bodyFontFace: settings.fontFace };
  const pages: Slide[] = [], warnings: string[] = [], context = document.createElement("canvas").getContext("2d")!;
  const imageCache = new Map<string, string>();
  let y = M, page: Slide, model: SlideModel;
  const special = () => ["title", "section", "end"].includes(model.type);
  const addPage = () => { if (pages.length >= 200) throw new Error("SLIDE_LIMIT"); signal.throwIfAborted(); page = pptx.addSlide(); page.background = { color: special() ? settings.theme.primary : settings.theme.background }; page.addShape(pptx.ShapeType.rect, { x: M, y: H - .47, w: W - 2 * M, h: .02, fill: { color: settings.theme.accent }, line: { transparency: 100 } }); pages.push(page); y = M; return page; };
  const bodyColor = () => special() ? settings.theme.textOnPrimary : settings.theme.textOnContent;
  const reserve = (height: number) => { if (y + height > bottom && y > M + .01) addPage(); };
  const textBlock = (block: Block) => {
    const heading = block.kind === "heading", code = block.kind === "code";
    const content = block.runs?.length ? block.runs.map(run => run.text).join("") : block.text ?? "";
    if (!content.trim()) return;
    const defaultSize = heading ? settings.fontSize * ([2, 1.65, 1.4, 1.2, 1.1, 1][(block.headingLevel ?? 1) - 1] ?? 1) : code ? settings.fontSize * .8 : settings.fontSize;
    const fontSize = Math.min(56, Math.max(8, settings.preserveStyles && block.css.fontSize ? block.css.fontSize * .75 : defaultSize));
    const runs: TextRun[] = (block.runs?.length ? block.runs : [{ text: content }]).map(run => ({ text: run.text, options: settings.preserveStyles ? { ...run.options, fontSize: Math.min(56, Math.max(8, run.options?.fontSize ?? fontSize)) } : { bold: run.options?.bold, italic: run.options?.italic, underline: run.options?.underline, hyperlink: run.options?.hyperlink } }));
    const largest = Math.max(fontSize, ...runs.map(run => run.options?.fontSize ?? fontSize));
    const face = code ? "Consolas" : settings.preserveStyles ? block.css.fontFamily ?? settings.fontFace : settings.fontFace;
    context.font = `${heading ? "bold " : ""}${largest * 96 / 72}px ${face}`;
    const indent = block.kind === "listItem" ? Math.min(1.2, ((block.listLevel ?? 1) - 1) * .25) : 0;
    const width = W - 2 * M - indent;
    const lines = lineRanges(content, (width - .12) * 96, context);
    const lineHeight = largest / 72 * Math.max(1.15, settings.lineSpacing) * 1.1;
    let first = 0;
    while (first < lines.length) {
      signal.throwIfAborted(); reserve(lineHeight + .12);
      const count = Math.max(1, Math.min(lines.length - first, Math.floor((bottom - y - .1) / lineHeight)));
      const start = lines[first][0], end = lines[first + count - 1][1];
      const isRtl = !code && rtl(content, block.css.direction ?? settings.direction);
      const align: "left" | "right" | "center" = heading && special() || block.css.textAlign === "center" ? "center" : isRtl ? "right" : settings.preserveStyles && block.css.textAlign ? block.css.textAlign : "left";
      const formatted = splitRuns(runs, start, end).map(run => ({ text: run.text, options: { ...run.options, fontFace: settings.preserveStyles && !code ? run.options?.fontFace ?? face : face, fontSize: run.options?.fontSize ?? fontSize, bold: run.options?.bold ?? heading, color: run.options?.color ?? (settings.preserveStyles ? colorHex(block.css.color) ?? bodyColor() : bodyColor()), align, rtlMode: isRtl, lang: isRtl ? "fa-IR" : "en-US", lineSpacingMultiple: settings.lineSpacing, breakLine: false, underline: run.options?.underline ? { style: "sng" as const } : undefined } }));
      page.addText(formatted, { x: M + (isRtl ? 0 : indent), y, w: width, h: count * lineHeight + .1, fontFace: face, fontSize, color: settings.preserveStyles ? colorHex(block.css.color) ?? bodyColor() : bodyColor(), bold: heading, align, rtlMode: isRtl, lang: isRtl ? "fa-IR" : "en-US", margin: 0, breakLine: false, lineSpacingMultiple: settings.lineSpacing, valign: "top", ...(code ? { fill: { color: "F1F5F9" }, color: "172033", margin: 4 } : {}), ...(block.kind === "listItem" && first === 0 ? { bullet: block.listType === "ol" ? { type: "number" as const, numberStartAt: block.listNumber ?? 1 } : { indent: fontSize }, indentLevel: Math.max(0, (block.listLevel ?? 1) - 1) } : {}) });
      y += count * lineHeight + .15; first += count;
      if (first < lines.length) addPage();
    }
  };
  let done = 0; const total = models.reduce((sum, slide) => sum + slide.blocks.length, 0);
  for (model of models) {
    addPage();
    if (settings.notes) page!.addNotes(model.blocks.map(block => block.text ?? block.alt ?? block.rows?.map(row => row.join(" | ")).join("\n") ?? "").filter(Boolean).join("\n\n"));
    for (const block of model.blocks) {
      signal.throwIfAborted();
      if (block.kind === "image") {
        if (settings.includeImages && block.src) {
          try {
            let data = imageCache.get(block.src); if (!data) { data = await imageData(block.src, settings.allowRemoteImages, signal); imageCache.set(block.src, data); }
            const size = await imageSize(data); signal.throwIfAborted();
            const maxH = bottom - M - .1, maxW = W - 2 * M;
            const scale = Math.min(1, Math.min(maxW * 96, block.width ?? size.width) / size.width, Math.min(maxH * 96, block.height ?? size.height) / size.height);
            const w = size.width * scale / 96, h = size.height * scale / 96;
            reserve(h + .15); page!.addImage({ data, x: (W - w) / 2, y, w, h, altText: block.alt }); y += h + .2;
          } catch (error) { if (signal.aborted) throw error; const reason = error instanceof Error && error.message === "REMOTE_IMAGE_DISABLED" ? "External image skipped; enable remote image downloads to include it." : "Image unavailable or unsupported. Check the format, size, network and CORS permissions."; warnings.push(`${block.alt || "Image"}: ${reason}`); if (block.alt) textBlock({ kind: "paragraph", text: `[${block.alt}]`, css: {} }); }
        }
      } else if (block.kind === "table" && block.rows?.length) {
        const tableRows = block.rows;
        if (tableRows.length > 1000) throw new Error("TABLE_ROW_LIMIT");
        const grid: { row: number; col: number; text: string; colspan: number; rowspan: number }[] = [];
        const occupied = new Map<number, Set<number>>(); let columns = 0;
        for (let row = 0; row < tableRows.length; row++) {
          let column = 0;
          for (let cell = 0; cell < tableRows[row].length; cell++) {
            while (occupied.get(row)?.has(column)) column++;
            const colspan = Math.min(100, block.colSpans?.[row]?.[cell] || 1), rowspan = Math.min(tableRows.length - row, block.rowSpans?.[row]?.[cell] || 1);
            grid.push({ row, col: column, text: tableRows[row][cell], colspan, rowspan });
            for (let r = row; r < row + rowspan; r++) { if (!occupied.has(r)) occupied.set(r, new Set()); for (let c = column; c < column + colspan; c++) occupied.get(r)!.add(c); }
            column += colspan; columns = Math.max(columns, column);
          }
        }
        const fontSize = Math.max(9, settings.fontSize * .8), colWidth = (W - 2 * M) / Math.max(1, columns);
        context.font = `${fontSize * 96 / 72}px ${settings.fontFace}`;
        const rowHeights = tableRows.map(() => .32);
        for (const cell of grid) {
          const lineCount = lineRanges(cell.text, Math.max(20, (colWidth * cell.colspan - .15) * 96), context).length;
          const required = lineCount * fontSize / 72 * 1.45 + .15;
          for (let row = cell.row; row < cell.row + cell.rowspan; row++) rowHeights[row] = Math.max(rowHeights[row], required / cell.rowspan);
        }
        const groups: { start: number; end: number; height: number }[] = [];
        for (let row = 0; row < tableRows.length;) {
          let end = row + 1;
          for (let index = row; index < end; index++) for (const cell of grid.filter(cell => cell.row === index)) end = Math.max(end, cell.row + cell.rowspan);
          groups.push({ start: row, end, height: rowHeights.slice(row, end).reduce((sum, height) => sum + height, 0) }); row = end;
        }
        if (columns > 16 || groups.some(group => group.height > bottom - M)) {
          warnings.push("Oversized table converted to text to preserve all cell content.");
          for (const row of tableRows) textBlock({ kind: "paragraph", text: row.join(" | "), css: {} });
        } else {
          const draw = (group: { start: number; end: number; height: number }) => {
            for (const cell of grid.filter(cell => cell.row >= group.start && cell.row < group.end)) {
              const top = y + rowHeights.slice(group.start, cell.row).reduce((sum, height) => sum + height, 0);
              const h = rowHeights.slice(cell.row, cell.row + cell.rowspan).reduce((sum, height) => sum + height, 0);
              const x = M + cell.col * colWidth, w = cell.colspan * colWidth;
              page.addShape(pptx.ShapeType.rect, { x, y: top, w, h, fill: { color: cell.row === 0 ? settings.theme.tableHeaderBg : cell.row % 2 ? settings.theme.tableRowOdd : settings.theme.tableRowEven }, line: { color: settings.theme.tableBorder, width: .5 } });
              page.addText(cell.text, { x: x + .05, y: top + .04, w: w - .1, h: h - .08, fontSize, fontFace: settings.fontFace, color: cell.row === 0 ? settings.theme.tableHeaderText : settings.theme.textOnContent, bold: cell.row === 0, align: rtl(cell.text, settings.direction) ? "right" : "left", rtlMode: rtl(cell.text, settings.direction), margin: 0, valign: "middle", lineSpacingMultiple: 1.15 });
            }
            y += group.height;
          };
          for (let index = 0; index < groups.length; index++) {
            const group = groups[index];
            if (y + group.height > bottom) {
              addPage();
              if (index > 0 && groups[0].height + group.height <= bottom - M) draw(groups[0]);
            }
            draw(group);
          }
          y += .2;
        }
      } else textBlock(block);
      progress(++done, total); await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
  for (let index = 0; index < pages.length; index++) {
    if (settings.showNumbers) pages[index].addText(`${index + 1} / ${pages.length}`, { x: W - M - 1, y: H - .35, w: 1, h: .2, fontSize: 8, color: settings.theme.footerColor, align: "right", margin: 0 });
    if (settings.footer) pages[index].addText(settings.footer, { x: M, y: H - .35, w: W - 2 * M - 1.2, h: .2, fontSize: 8, color: settings.theme.footerColor, fontFace: settings.fontFace, rtlMode: rtl(settings.footer, settings.direction), margin: 0 });
  }
  signal.throwIfAborted();
  const blob = await pptx.write({ outputType: "blob", compression: true }) as Blob;
  signal.throwIfAborted();
  return { blob, slides: pages.length, warnings };
}

