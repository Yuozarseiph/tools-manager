"use client";

import { useState } from "react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useSecurityToolsUIContent } from "../security-tools.content";
import { FileText, Copy, Check, Lock } from "lucide-react";

export default function OneTimeNote() {
  const theme = useThemeColors();
  const content = useSecurityToolsUIContent();

  const [noteContent, setNoteContent] = useState("");
  const [expiresIn, setExpiresIn] = useState("24h");
  const [maxViews, setMaxViews] = useState("1");
  const [password, setPassword] = useState("");
  const [noteLink, setNoteLink] = useState("");
  const [copied, setCopied] = useState(false);

  const createNote = () => {
    if (!noteContent.trim()) return;

    // Generate unique ID (در پروژه واقعی از API استفاده کنید)
    const noteId = Math.random().toString(36).substring(2, 15);
    const link = `${window.location.origin}/note/${noteId}`;

    // در پروژه واقعی اینجا باید به سرور ارسال شود
    console.log({
      id: noteId,
      content: noteContent,
      expiresIn,
      maxViews,
      password,
    });

    setNoteLink(link);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(noteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setNoteContent("");
    setPassword("");
    setNoteLink("");
  };

  return (
    <div className="space-y-6">
      {!noteLink ? (
        <>
          {/* Note Content */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
              {content.oneTimeNote.noteContent}
            </label>
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={8}
              placeholder="متن یادداشت خود را اینجا وارد کنید..."
              className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
            />
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
                {content.oneTimeNote.expiresIn}
              </label>
              <select
                value={expiresIn}
                onChange={(e) => setExpiresIn(e.target.value)}
                className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
              >
                {Object.entries(content.oneTimeNote.expires).map(
                  ([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
                {content.oneTimeNote.maxViews}
              </label>
              <select
                value={maxViews}
                onChange={(e) => setMaxViews(e.target.value)}
                className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
              >
                {Object.entries(content.oneTimeNote.views).map(
                  ([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
              {content.oneTimeNote.password}
            </label>
            <div className="relative">
              <Lock
                size={20}
                className={`absolute right-3 top-3 ${theme.textMuted}`}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="برای امنیت بیشتر رمز تنظیم کنید"
                className={`w-full p-3 pr-12 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
              />
            </div>
          </div>

          {/* Create Button */}
          <button
            onClick={createNote}
            disabled={!noteContent.trim()}
            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 ${theme.primary} text-white disabled:opacity-50`}
          >
            <FileText size={20} />
            {content.oneTimeNote.createNote}
          </button>
        </>
      ) : (
        <>
          {/* Success Message */}
          <div
            className={`p-6 rounded-xl border-2 border-[var(--app-success-border)] bg-[var(--app-success-bg)]`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-green-500">
                <Check size={24} className="text-white" />
              </div>
              <div>
                <h3 className={`font-bold text-lg ${theme.text}`}>
                  {content.oneTimeNote.noteCreated}
                </h3>
                <p className={`text-sm ${theme.textMuted}`}>
                  لینک زیر را با گیرنده به اشتراک بگذارید
                </p>
              </div>
            </div>

            {/* Link Display */}
            <div
              className={`p-4 rounded-xl ${theme.bg} border ${theme.border} mb-4`}
            >
              <p className={`text-sm break-all ${theme.text}`}>{noteLink}</p>
            </div>

            {/* Copy Button */}
            <button
              onClick={copyLink}
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 ${theme.primary} text-white`}
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
              {copied
                ? content.oneTimeNote.linkCopied
                : content.oneTimeNote.copyLink}
            </button>
          </div>

          {/* Create Another */}
          <button
            onClick={resetForm}
            className={`w-full py-3 rounded-xl font-medium ${theme.secondary} ${theme.text}`}
          >
            ساخت یادداشت جدید
          </button>

          {/* Info */}
          <div
            className={`p-4 rounded-xl bg-[var(--app-warning-bg)] border border-[var(--app-warning-border)]`}
          >
            <p className={`text-sm ${theme.textMuted}`}>
              ⚠️ این لینک پس از{" "}
              {
                content.oneTimeNote.expires[
                  expiresIn as keyof typeof content.oneTimeNote.expires
                ]
              }{" "}
              یا پس از{" "}
              {
                content.oneTimeNote.views[
                  maxViews as keyof typeof content.oneTimeNote.views
                ]
              }{" "}
              مشاهده منقضی می‌شود.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
