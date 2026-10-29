"use client";

import { useEffect, useRef, useState } from "react";
import { Code2 } from "lucide-react";
import {
  EditorView, keymap, lineNumbers, highlightActiveLine, highlightSpecialChars,
  drawSelection, rectangularSelection, placeholder,
} from "@codemirror/view";
import { Compartment, EditorState, type Extension } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import {
  syntaxHighlighting, defaultHighlightStyle, bracketMatching, indentOnInput,
  foldGutter, foldKeymap, StreamLanguage,
} from "@codemirror/language";
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { openSearchPanel, searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import { lintKeymap } from "@codemirror/lint";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import { VirtualFile } from "../types";
import "../code-editor.css";

type LanguageExtension = Extension;
const languageCache = new Map<string, LanguageExtension>();

async function loadLanguage(language: string): Promise<LanguageExtension> {
  const cached = languageCache.get(language);
  if (cached) return cached;
  let extension: LanguageExtension;
  switch (language) {
    case "javascript": extension = javascript(); break;
    case "typescript": extension = javascript({ typescript: true }); break;
    case "jsx": extension = javascript({ jsx: true }); break;
    case "tsx": extension = javascript({ jsx: true, typescript: true }); break;
    case "html": extension = html(); break;
    case "css": case "scss": extension = css(); break;
    case "json": extension = json(); break;
    case "markdown": extension = markdown(); break;
    case "python": extension = python(); break;
    case "php": extension = (await import("@codemirror/lang-php")).php(); break;
    case "java": extension = (await import("@codemirror/lang-java")).java(); break;
    case "cpp": case "c": case "csharp": case "go":
      extension = (await import("@codemirror/lang-cpp")).cpp(); break;
    case "rust": extension = (await import("@codemirror/lang-rust")).rust(); break;
    case "sql": extension = (await import("@codemirror/lang-sql")).sql(); break;
    case "xml": extension = (await import("@codemirror/lang-xml")).xml(); break;
    case "yaml": extension = StreamLanguage.define((await import("@codemirror/legacy-modes/mode/yaml")).yaml); break;
    case "shell": case "dockerfile": extension = StreamLanguage.define((await import("@codemirror/legacy-modes/mode/shell")).shell); break;
    default: extension = []; break;
  }
  languageCache.set(language, extension);
  return extension;
}

interface Props {
  file: VirtualFile | null;
  onContentChange: (fileId: string, content: string) => void;
  onCursorChange?: (line: number, column: number) => void;
  theme: { mode?: string };
  locale?: string;
  jump?: {fileId: string;line: number;token: number} | null;
}

export default function Editor({ file, onContentChange, onCursorChange, theme, locale, jump }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const statesRef = useRef(new Map<string, EditorState>());
  const themeCompartmentRef = useRef(new Compartment());
  const onChangeRef = useRef(onContentChange);
  const jumpRef = useRef(jump);
  const onCursorRef = useRef(onCursorChange);
  const [failed, setFailed] = useState(false);
  const isDark = theme.mode === "dark";
  const fileId = file?.id;
  const language = file?.language;
  onChangeRef.current = onContentChange;
  jumpRef.current = jump;
  onCursorRef.current = onCursorChange;

  useEffect(() => {
    if (!fileId || !file || !containerRef.current) return;
    let cancelled = false;
    let createdView: EditorView | null = null;
    setFailed(false);
    const initialContent = file.content;
    void (async () => {
      try {
        const lang = await loadLanguage(language || "plaintext");
        if (cancelled || !containerRef.current) return;
        const cached = statesRef.current.get(fileId);
        const state = cached && cached.doc.toString() === initialContent
          ? cached
          : EditorState.create({
              doc: initialContent,
              extensions: [
                lineNumbers(), foldGutter(), highlightActiveLine(), highlightSpecialChars(),
                drawSelection(), rectangularSelection(), highlightSelectionMatches(),
                bracketMatching(), closeBrackets(), autocompletion(), indentOnInput(),
                history(), syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
                EditorView.lineWrapping, placeholder("// Start typing or open a project…"), lang,
                themeCompartmentRef.current.of(isDark ? oneDark : []),
                EditorView.updateListener.of((update) => {
                  if (update.docChanged) onChangeRef.current(fileId, update.state.doc.toString());
                  if (update.selectionSet || update.docChanged) {
                    const position = update.state.selection.main.head;
                    const line = update.state.doc.lineAt(position);
                    onCursorRef.current?.(line.number, position - line.from + 1);
                  }
                }),
                keymap.of([
                  ...defaultKeymap, ...historyKeymap, ...foldKeymap,
                  ...completionKeymap, ...closeBracketsKeymap, ...searchKeymap,
                  ...lintKeymap, indentWithTab,
                ]),
              ],
            });
        createdView = new EditorView({ state, parent: containerRef.current });
        viewRef.current = createdView;
        createdView.dispatch({effects: themeCompartmentRef.current.reconfigure(isDark ? oneDark : [])});
        const requested = jumpRef.current;
        if (requested && requested.fileId === fileId) {
          const line = createdView.state.doc.line(Math.min(Math.max(1,requested.line),createdView.state.doc.lines));
          createdView.dispatch({selection:{anchor:line.from},scrollIntoView:true});
          createdView.focus();
        }
        const pos = createdView.state.selection.main.head;
        const line = createdView.state.doc.lineAt(pos);
        onCursorRef.current?.(line.number, pos - line.from + 1);
        createdView.focus();
      } catch (error) {
        console.error("Code editor initialization failed", error);
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
      if (createdView) {
        statesRef.current.set(fileId, createdView.state);
        if (viewRef.current === createdView) viewRef.current = null;
        createdView.destroy();
      }
    };
    // Retain the editor and undo stack across ordinary content updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileId, language]);

  useEffect(() => {
    const view = viewRef.current;
    if (view) view.dispatch({ effects: themeCompartmentRef.current.reconfigure(isDark ? oneDark : []) });
  }, [isDark, fileId]);

  useEffect(() => {
    const view = viewRef.current;
    if (view && jump && jump.fileId === fileId) {
      const line = view.state.doc.line(Math.min(Math.max(1,jump.line),view.state.doc.lines));
      view.dispatch({selection:{anchor:line.from}, scrollIntoView:true});
      view.focus();
    }
  }, [jump?.token, fileId]);

  useEffect(() => {
    const onFind = () => {if (viewRef.current) {openSearchPanel(viewRef.current); viewRef.current.focus();}};
    window.addEventListener("qf-code-find", onFind);
    return () => window.removeEventListener("qf-code-find", onFind);
  }, []);

  if (!file) return (
    <div className="qf-editor-welcome" dir={locale === "fa" ? "rtl" : "ltr"}>
      <Code2 size={42} strokeWidth={1.2}/>
      <h3>{locale === "fa" ? "یک فایل باز کنید یا فایل جدید بسازید" : "Open or create a file to get started"}</h3>
      <p>{locale === "fa" ? "Ctrl+P برای باز کردن سریع فایل · Ctrl+Shift+F برای جستجو" : "Ctrl+P quick open · Ctrl+Shift+F workspace search"}</p>
      <p>{locale === "fa" ? "فایل‌ها روی دستگاه شما ویرایش می‌شوند؛ اجرای کد یا ترمینال ارائه نمی‌شود." : "Edit files locally. Code execution and a terminal are not included."}</p>
    </div>
  );

  return (
    <div className="qf-editor-code-pane" dir="ltr">
      <div ref={containerRef} className="qf-editor-codemirror" aria-label={file.name} />
      {failed && <textarea aria-label={file.name} className="qf-editor-fallback" value={file.content}
        onChange={(event) => onContentChange(file.id, event.target.value)} spellCheck={false} />}
    </div>
  );
}
