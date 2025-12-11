"use client";

import { useState, type ChangeEvent, type ReactNode } from "react";
import { Wand2 } from "lucide-react";

import { useThemeColors } from "@/hooks/useThemeColors";
import { useImageEditorContent } from "./image-editor.content";
import FiltersTab from "./tabs/FiltersTab";
import ResizeTab from "./tabs/ResizeTab";
import RotateTab from "./tabs/RotateTab";
import TextTab from "./tabs/TextTab";

type EditorTab = "filters" | "resize" | "rotate" | "text";
type ImageSource = "file" | "url" | null;

export default function ImageEditorTool() {
  const theme = useThemeColors();
  const content = useImageEditorContent();

  const [activeTab, setActiveTab] = useState<EditorTab>("filters");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageSource, setImageSource] = useState<ImageSource>(null);
  const [imageUrlInput, setImageUrlInput] = useState("");

  const revokeIfFile = () => {
    if (imageSource === "file" && imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    revokeIfFile();

    const url = URL.createObjectURL(file);
    setImageFile(file);
    setImageUrl(url);
    setImageSource("file");
    setImageUrlInput("");
  };

  const handleUrlLoad = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;

    // می‌توانی اینجا ولیدیشن ساده هم اضافه کنی (مثلاً startsWith("http"))
    revokeIfFile();

    setImageFile(null);
    setImageUrl(trimmed);
    setImageSource("url");
  };

  const clearImage = () => {
    revokeIfFile();
    setImageFile(null);
    setImageUrl(null);
    setImageSource(null);
    setImageUrlInput("");
  };

  const tabs: { id: EditorTab; label: string }[] = [
    { id: "filters", label: content.ui.filters.title },
    { id: "resize", label: content.ui.resizeTab.title },
    { id: "rotate", label: content.ui.rotateTab.title },
    { id: "text", label: content.ui.textTab.title },
  ];

  const tabContent: Record<EditorTab, ReactNode> = {
    filters: <FiltersTab imageUrl={imageUrl} hasImage={!!imageUrl} />,
    resize: <ResizeTab imageUrl={imageUrl} hasImage={!!imageUrl} />,
    rotate: <RotateTab imageUrl={imageUrl} hasImage={!!imageUrl} />,
    text: <TextTab imageUrl={imageUrl} hasImage={!!imageUrl} />,
  };

  return (
    <div className={`flex flex-col gap-6 ${theme.bg}`}>
      {/* هدر بالای ادیتور */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${theme.primary}`}>
            <Wand2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className={`text-xl font-semibold ${theme.text}`}>
              {content.title}
            </h2>
            <p className={`text-xs ${theme.textMuted}`}>
              {content.description}
            </p>
          </div>
        </div>

        {/* ورودی فایل + URL */}
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <div className="flex flex-wrap items-center gap-2 justify-end">
            <input
              id="image-editor-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="image-editor-upload"
              className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer bg-blue-600 text-white hover:bg-blue-500"
            >
              {content.ui.editorHeader.upload}
            </label>

            <div className="flex items-center gap-2">
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder={content.ui.editorHeader.urlPlaceholder}
                className={`w-40 md:w-64 px-2 py-1.5 rounded-lg text-xs border ${theme.border} ${theme.bg} ${theme.text} focus:outline-none focus:ring-1 focus:ring-blue-500`}
              />
              <button
                type="button"
                onClick={handleUrlLoad}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-100 hover:bg-slate-700"
              >
                {content.ui.editorHeader.urlLoad}
              </button>
            </div>

            {imageUrl && (
              <button
                onClick={clearImage}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-100 hover:bg-slate-700"
              >
                {content.ui.editorHeader.clear}
              </button>
            )}
          </div>

          <p className={`text-[10px] leading-snug ${theme.textMuted} text-right`}>
            {content.ui.editorHeader.urlHint}
          </p>
        </div>
      </div>

      {/* تب‌ها */}
      <div
        className={`inline-flex rounded-xl border p-1 gap-1 ${theme.card} ${theme.border}`}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.id
                ? `${theme.primary} text-white`
                : `${theme.bg} ${theme.text} hover:${theme.secondary}`
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* محتوای تب فعال */}
      <div className={`rounded-2xl border p-4 ${theme.card} ${theme.border}`}>
        {tabContent[activeTab]}
      </div>
    </div>
  );
}
