import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Locale } from "./locale-detection";
export async function ogImage(title: string, locale: Locale) {
  const font = await readFile(path.join(process.cwd(), "public/fonts/Vazirmatn-Regular.ttf"));
  const rows: string[][] = [[]];
  for (const word of title.split(/\s+/)) {
    if (rows.at(-1)!.join(" ").length + word.length > 28) rows.push([]);
    rows.at(-1)!.push(word);
  }
  return new ImageResponse(<div style={{ display: "flex", width: "100%", height: "100%", background: "#061c30", color: "#f3efe6", padding: "70px", flexDirection: "column", justifyContent: "space-between", fontFamily: "Vazirmatn" }}>
    <div style={{ display: "flex", fontSize: 38, color: "#7fa7c9" }}>QodeForge</div>
    {locale === "fa" ? <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", fontSize: 62, lineHeight: 1.4 }}>
      {rows.map((words, index) => <div key={index} style={{ display: "flex", flexDirection: "row-reverse", gap: 18 }}>{words.map((word, i) => <span key={i}>{word}</span>)}</div>)}
    </div> : <div style={{ display: "flex", fontSize: 62, lineHeight: 1.4 }}>{title}</div>}
    <div style={{ display: "flex", fontSize: 28 }}>{locale === "fa" ? "qodeforge.ir · Browser tools · FA" : "Free browser tools · qodeforge.ir"}</div>
  </div>, { width: 1200, height: 630, fonts: [{ name: "Vazirmatn", data: font, weight: 400, style: "normal" }] });
}
