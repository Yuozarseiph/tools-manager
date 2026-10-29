"use client";
import { useId, type ComponentProps, type ChangeEvent, type CSSProperties } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { convertPersianToEnglish } from "@/utils/persian-number-converter";
import Image from "next/image";
import PanelSelect from "./PanelSelect";
import PanelSpecialInput from "./PanelSpecialInput";

type Purpose = { fieldLabel?: string; hasVisibleLabel?: boolean };
function useControl(props: Purpose & { id?: string; name?: string; placeholder?: string; "aria-label"?: string; "aria-labelledby"?: string }, fallback: string) {
  const autoId = useId(); const id = props.id ?? `control-${autoId}`;
  const label = props.fieldLabel || props["aria-label"] || props.name || props.placeholder || fallback;
  return { id, label, labelled: Boolean(props["aria-labelledby"]) };
}
export function AccessibleInput({ fieldLabel, hasVisibleLabel, numeric, ...props }: ComponentProps<"input"> & Purpose & { numeric?: boolean }) {
  const { locale } = useLanguage();
  const fallback = props.type === "file" ? ["انتخاب فایل", "Select file"] : props.type === "date" ? ["انتخاب تاریخ شمسی", "Choose Gregorian date"] : props.type === "color" ? ["انتخاب رنگ", "Choose color"] : ["ورودی", "Input"];
  const control = useControl({ ...props, fieldLabel }, fallback[locale === "fa" ? 0 : 1]);
  return <>
    {!control.labelled && !hasVisibleLabel && <label htmlFor={control.id} className="sr-only">{control.label}</label>}
    {props.type === "color" || props.type === "date" ? <PanelSpecialInput {...props} id={control.id} name={props.name ?? control.id} aria-label={props["aria-label"] ?? (props["aria-labelledby"] ? undefined : control.label)} /> : <input {...props} id={control.id} name={props.name ?? control.id} {...(props.type === "file" ? { "data-testid": "file-upload", ...(props.tabIndex === -1 ? { style: { ...props.style, display: "none" } } : {}) } : {})}
      {...(props.type === "number" || numeric ? { inputMode: props.inputMode ?? "decimal", dir: props.dir ?? "ltr" } : {})}
      {...(props.type === "range" ? { style: { ...props.style, "--panel-range-fill": `${Math.min(100, Math.max(0, (Number(props.value ?? props.defaultValue ?? 50) - Number(props.min ?? 0)) / (Number(props.max ?? 100) - Number(props.min ?? 0) || 1) * 100))}%` } as CSSProperties } : {})}
      {...(numeric ? { type: "text", onChange: (event: ChangeEvent<HTMLInputElement>) => {
        event.currentTarget.value = String(convertPersianToEnglish(event.currentTarget.value));
        props.onChange?.(event);
      } } : {})} />}
  </>;
}
export function AccessibleTextarea({ fieldLabel, hasVisibleLabel, ...props }: ComponentProps<"textarea"> & Purpose) {
  const { locale } = useLanguage(); const control = useControl({ ...props, fieldLabel }, locale === "fa" ? "متن ورودی" : "Input text");
  return <>{!control.labelled && !hasVisibleLabel && <label htmlFor={control.id} className="sr-only">{control.label}</label>}<textarea {...props} id={control.id} name={props.name ?? control.id} /></>;
}
export function AccessibleSelect({ fieldLabel, hasVisibleLabel, ...props }: ComponentProps<"select"> & Purpose) {
  const { locale } = useLanguage(); const control = useControl({ ...props, fieldLabel }, locale === "fa" ? "انتخاب گزینه" : "Select an option");
  return <>{!control.labelled && !hasVisibleLabel && <label htmlFor={control.id} className="sr-only">{control.label}</label>}<PanelSelect {...props} id={control.id} aria-label={props["aria-label"] ?? (props["aria-labelledby"] ? undefined : control.label)} name={props.name ?? control.id} /></>;
}
export function AccessiblePreview({ alt, purpose = "preview", ...props }: ComponentProps<"img"> & { purpose?: "preview" | "input" | "output" | "crop" | "ocr" }) {
  const { locale } = useLanguage();
  const labels = {
    fa: { preview: "پیش‌نمایش تصویر انتخاب‌شده", input: "تصویر ورودی انتخاب‌شده برای پردازش", output: "پیش‌نمایش تصویر پس از پردازش", crop: "محدوده انتخاب‌شده برای برش تصویر", ocr: "تصویر ورودی برای استخراج متن" },
    en: { preview: "Preview of the selected image", input: "Input image selected for processing", output: "Preview of the processed image", crop: "Selected image crop region", ocr: "Input image for text recognition" },
  };
  // User-selected blob/data images must keep the native preview behavior.
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...props} alt={alt === "" ? "" : labels[locale][purpose]} />;
}

export function AccessibleImage({ alt, purpose = "preview", ...props }: ComponentProps<typeof Image> & { purpose?: "preview" | "input" | "output" | "crop" | "ocr" }) {
  const { locale } = useLanguage();
  const label = locale === "fa" ? (purpose === "output" ? "پیش‌نمایش تصویر پس از پردازش" : purpose === "input" ? "تصویر ورودی انتخاب‌شده برای پردازش" : "پیش‌نمایش تصویر انتخاب‌شده") : (purpose === "output" ? "Preview of the processed image" : purpose === "input" ? "Input image selected for processing" : "Preview of the selected image");
  return <Image {...props} alt={alt === "" ? "" : label} />;
}

export function AccessibleButton({ purpose = "action", ...props }: ComponentProps<"button"> & { purpose?: string }) {
  const { locale } = useLanguage();
  const labels: Record<string, [string, string]> = {
    close: ["بستن", "Close"], delete: ["حذف", "Delete"], copy: ["کپی", "Copy"], download: ["دانلود خروجی", "Download result"], upload: ["انتخاب فایل", "Select file"],
    help: ["راهنما", "Help"], zoomIn: ["بزرگ‌نمایی", "Zoom in"], zoomOut: ["کوچک‌نمایی", "Zoom out"], undo: ["واگرد", "Undo"], redo: ["انجام دوباره", "Redo"], rotate: ["چرخش", "Rotate"], action: ["اجرای عملیات", "Run action"],
  };
  const label = labels[purpose] ?? labels.action;
  return <button {...props} aria-label={props["aria-label"] ?? label[locale === "fa" ? 0 : 1]} />;
}

export function AccessibleDropzone(props: ComponentProps<"div">) {
  const { locale } = useLanguage();
  return <div {...props} role="button" tabIndex={props.tabIndex ?? 0}
    aria-label={props["aria-label"] ?? (locale === "fa" ? "انتخاب فایل یا کشیدن و رها کردن فایل در این قسمت" : "Select files or drag and drop files here")}
    onKeyDown={event => {
      if (props.onKeyDown) props.onKeyDown(event);
      else if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); }
    }} />;
}
