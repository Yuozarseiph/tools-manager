import type { ExportSettings } from "./pptx-export";
import { ASPECT_RATIO_DIMENSIONS } from "./HtmlParser";
export async function exportVisual(html: string, settings: ExportSettings, scale: number, signal: AbortSignal, progress: (done: number, total: number) => void) {
  const [{ default: html2canvas }, { default: Pptx }] = await Promise.all([import("html2canvas"), import("pptxgenjs")]);
  const source = new DOMParser().parseFromString(html, "text/html");
  source.querySelectorAll("script,iframe,object,embed,link,meta,base,form").forEach(element => element.remove());
  source.querySelectorAll("*").forEach(element => { for (const attribute of Array.from(element.attributes)) if (/^on/i.test(attribute.name)) element.removeAttribute(attribute.name); });
  if (!settings.includeImages) source.querySelectorAll("img,svg,picture").forEach(element => element.remove());
  const csp = source.createElement("meta"); csp.httpEquiv = "Content-Security-Policy";
  csp.content = `default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src data: blob:${settings.allowRemoteImages && settings.includeImages ? " https: http:" : ""}; font-src data:; connect-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'`;
  source.head.prepend(csp);
  const dims = ASPECT_RATIO_DIMENSIONS[settings.aspectRatio], width = 1280, height = Math.round(width * dims.height / dims.width);
  const style = source.createElement("style"); style.textContent = `html { width:${width}px; } body { margin:0; min-height:${height}px; font-family:${JSON.stringify(settings.fontFace)}; } img { max-width:100%; } .slide,[data-slide] { box-sizing:border-box; min-height:${height}px; width:100%; }`;
  source.head.append(style);
  if (settings.direction !== "auto") source.documentElement.dir = settings.direction;
  const frame = document.createElement("iframe"); frame.setAttribute("sandbox", "allow-same-origin"); frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = `position:fixed;left:-20000px;top:0;width:${width}px;height:${height}px;border:0;pointer-events:none;`;
  const pages: ReturnType<InstanceType<typeof Pptx>["addSlide"]>[] = [];
  try {
    await new Promise<void>((resolve, reject) => { const timer = setTimeout(() => reject(new Error("HTML_RENDER_TIMEOUT")), 15000); frame.onload = () => { clearTimeout(timer); resolve(); }; frame.srcdoc = `<!doctype html>${source.documentElement.outerHTML}`; document.body.append(frame); });
    signal.throwIfAborted(); const doc = frame.contentDocument!;
    await doc.fonts.ready;
    await Promise.all(Array.from(doc.images).map(image => image.complete ? Promise.resolve() : new Promise<void>(resolve => { const timer = setTimeout(resolve, 10000); image.onload = image.onerror = () => { clearTimeout(timer); resolve(); }; })));
    const explicit = Array.from(doc.querySelectorAll<HTMLElement>(".slide,[data-slide]")).filter(element => !element.parentElement?.closest(".slide,[data-slide]"));
    const targets = explicit.length ? explicit : [doc.body];
    const regions = targets.flatMap(element => { const count = Math.max(1, Math.ceil(element.scrollHeight / height)); return Array.from({ length: count }, (_, index) => ({ element, top: index * height })); });
    if (regions.length > 100) throw new Error("SLIDE_LIMIT");
    const pptx = new Pptx(); pptx.defineLayout({ name: "QodeForge", width: dims.width, height: dims.height }); pptx.layout = "QodeForge"; pptx.author = settings.author; pptx.title = settings.title;
    const warnings = Array.from(doc.images).filter(image => !image.complete || !image.naturalWidth).map(image => `Image unavailable: ${image.alt || image.getAttribute("src")?.slice(0, 80)}`);
    for (let index = 0; index < regions.length; index++) {
      signal.throwIfAborted(); const { element, top } = regions[index];
      const canvas = await html2canvas(element, { width, height, y: top, windowWidth: width, windowHeight: height, scale: Math.min(2, Math.max(1, scale)), useCORS: settings.allowRemoteImages, allowTaint: false, backgroundColor: "#ffffff", logging: false });
      signal.throwIfAborted(); const slide = pptx.addSlide(); pages.push(slide);
      slide.addImage({ data: canvas.toDataURL("image/png"), x: 0, y: 0, w: dims.width, h: dims.height });
      canvas.width = 0; canvas.height = 0;
      if (settings.notes) slide.addNotes(element.innerText);
      progress(index + 1, regions.length); await new Promise(resolve => setTimeout(resolve, 0));
    }
    pages.forEach((slide, index) => {
      if (settings.showNumbers) slide.addText(`${index + 1} / ${pages.length}`, { x: dims.width - 1.1, y: dims.height - .3, w: .9, h: .2, fontSize: 8, color: "334155", fill: { color: "FFFFFF", transparency: 15 }, margin: 0 });
      if (settings.footer) slide.addText(settings.footer, { x: .25, y: dims.height - .3, w: dims.width - 1.6, h: .2, fontSize: 8, color: "334155", fontFace: settings.fontFace, fill: { color: "FFFFFF", transparency: 15 }, margin: 0 });
    });
    signal.throwIfAborted(); const blob = await pptx.write({ outputType: "blob", compression: true }) as Blob; signal.throwIfAborted();
    return { blob, slides: pages.length, warnings };
  } finally { frame.remove(); }
}
