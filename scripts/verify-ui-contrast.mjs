import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Test the final token values, including later overrides in globals.css.
const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
function tokens(dark) {
  const colors = {};
  for (const block of css.matchAll(dark ? /:root\.dark\s*\{([^}]+)\}/g : /:root\s*\{([^}]+)\}/g)) {
    for (const [, name, value] of block[1].matchAll(/(--[\w-]+):\s*(#[a-f\d]{6})\s*;/gi)) colors[name] = value;
  }
  return colors;
}
function luminance(hex) {
  assert.match(hex ?? "", /^#[a-f\d]{6}$/i, "Missing contrast color");
  const rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
  return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
}
function contrast(a, b) {
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
}
for (const dark of [false, true]) {
  const colors = tokens(dark), text = [], controls = [];
  const check = (fg, bg, minimum, results) => {
    const ratio = contrast(colors[fg] ?? fg, colors[bg]);
    assert(ratio >= minimum, `${dark ? "Dark" : "Light"}: ${fg}/${bg} = ${ratio.toFixed(2)}, requires ${minimum}`);
    results.push(ratio);
  };
  for (const fg of ["--app-text", "--app-text-muted", "--app-accent"]) {
    for (const bg of ["--app-bg", "--app-card", "--app-menu", "--app-input-bg", "--app-secondary-bg"]) check(fg, bg, 4.5, text);
  }
  for (const bg of ["--app-primary-bg", "--app-primary-hover"]) check("#ffffff", bg, 4.5, text);
  for (const bg of ["--app-bg", "--app-card", "--app-input-bg"]) check("--app-input-border", bg, 3, controls);
  for (const bg of ["--app-bg", "--app-card", "--app-menu"]) check("--app-ring", bg, 3, controls);
  const header = css.match(dark ? /\.dark \.site-header\s*\{([^}]+)\}/ : /\.site-header\s*\{([^}]+)\}/)?.[1];
  const opacity = Number(header?.match(/var\(--app-card\)\s+(\d+)%/)?.[1]) / 100;
  assert(opacity > 0 && opacity < 1, "Expected a translucent header");
  const under = dark ? 255 : 0;
  const glass = "#" + [1, 3, 5].map(i => Math.round(parseInt(colors["--app-card"].slice(i, i + 2), 16) * opacity + under * (1 - opacity)).toString(16).padStart(2, "0")).join("");
  for (const fg of ["--app-text", "--app-text-muted", "--app-accent"]) {
    const ratio = contrast(colors[fg], glass);
    assert(ratio >= 4.5, `Glass header contrast for ${fg}: ${ratio.toFixed(2)}`);
    text.push(ratio);
  }
  console.log(`${dark ? "Dark" : "Light"}: ${text.length + controls.length} checks passed; minimum text ${Math.min(...text).toFixed(2)}:1, control boundary ${Math.min(...controls).toFixed(2)}:1.`);
}
