// components/tools/developer/code-editor/components/Editor.tsx
"use client";

import {
  useRef,
  useEffect,
  useCallback,
  useState,
  lazy,
  Suspense,
} from "react";
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
  highlightSpecialChars,
  drawSelection,
  rectangularSelection,
  crosshairCursor,
  placeholder,
} from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import {
  syntaxHighlighting,
  defaultHighlightStyle,
  bracketMatching,
  indentOnInput,
  foldGutter,
  foldKeymap,
  StreamLanguage,
} from "@codemirror/language";
import {
  autocompletion,
  completionKeymap,
  closeBrackets,
  closeBracketsKeymap,
} from "@codemirror/autocomplete";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import { lintKeymap } from "@codemirror/lint";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import { VirtualFile, SUPPORTED_LANGUAGES } from "../types";
import "../code-editor.css";

// Lazy load language extensions
let cachedExtensions: Record<string, any> = {};

async function loadLanguageExtension(language: string) {
  if (cachedExtensions[language]) return cachedExtensions[language];

  let ext;
  switch (language) {
    case "javascript":
      ext = javascript();
      break;
    case "typescript":
      ext = javascript({ typescript: true });
      break;
    case "jsx":
      ext = javascript({ jsx: true });
      break;
    case "tsx":
      ext = javascript({ jsx: true, typescript: true });
      break;
    case "html":
      ext = html();
      break;
    case "css":
    case "scss":
      ext = css();
      break;
    case "json":
      ext = json();
      break;
    case "markdown":
      ext = markdown();
      break;
    case "python":
      ext = python();
      break;
    case "php": {
      const { php } = await import("@codemirror/lang-php");
      ext = php();
      break;
    }
    case "java": {
      const { java } = await import("@codemirror/lang-java");
      ext = java();
      break;
    }
    case "cpp":
    case "c":
    case "csharp":
    case "go": {
      const { cpp } = await import("@codemirror/lang-cpp");
      ext = cpp();
      break;
    }
    case "rust": {
      const { rust } = await import("@codemirror/lang-rust");
      ext = rust();
      break;
    }
    case "sql": {
      const { sql } = await import("@codemirror/lang-sql");
      ext = sql();
      break;
    }
    case "xml": {
      const { xml } = await import("@codemirror/lang-xml");
      ext = xml();
      break;
    }
    case "yaml": {
      const { yaml } = await import("@codemirror/legacy-modes/mode/yaml");
      ext = StreamLanguage.define(yaml);
      break;
    }
    case "shell":
    case "dockerfile": {
      const { shell } = await import("@codemirror/legacy-modes/mode/shell");
      ext = StreamLanguage.define(shell);
      break;
    }
    default:
      ext = javascript();
  }

  cachedExtensions[language] = ext;
  return ext;
}

interface EditorPanelProps {
  file: VirtualFile | null;
  onContentChange: (fileId: string, content: string) => void;
  theme: any;
}

export default function EditorPanel({
  file,
  onContentChange,
  theme,
}: EditorPanelProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const isDark = theme.mode === "dark";

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!editorRef.current || !file || !isReady) return;

    let cancelled = false;

    async function initEditor() {
      try {
        const languageExt = await loadLanguageExtension(file!.language);

        if (cancelled) return;

        const extensions = [
          lineNumbers(),
          highlightActiveLine(),
          highlightSpecialChars(),
          drawSelection(),
          rectangularSelection(),
          crosshairCursor(),
          highlightSelectionMatches(),
          bracketMatching(),
          closeBrackets(),
          autocompletion(),
          indentOnInput(),
          history(),
          foldGutter(),
          syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
          placeholder("// Start coding..."),
          languageExt,
          keymap.of([
            ...defaultKeymap,
            ...historyKeymap,
            ...foldKeymap,
            ...completionKeymap,
            ...closeBracketsKeymap,
            ...searchKeymap,
            ...lintKeymap,
            indentWithTab,
            {
              key: "Mod-s",
              run: (view: any) => {
                onContentChange(file!.id, view.state.doc.toString());
                window.dispatchEvent(new CustomEvent("editor-save"));
                return true;
              },
              preventDefault: true,
            },
          ]),
          EditorView.updateListener.of((update) => {
            if (update.docChanged && viewRef.current) {
              onContentChange(file!.id, update.state.doc.toString());
            }
          }),
        ];

        if (isDark) {
          extensions.push(oneDark);
        }

        if (isMobile) {
          extensions.push(
            EditorView.theme({
              ".cm-gutters": { display: "none" },
              ".cm-content": { padding: "8px" },
            }),
          );
        }

        const state = EditorState.create({
          doc: file!.content,
          extensions,
        });

        if (viewRef.current) viewRef.current.destroy();

        viewRef.current = new EditorView({
          state,
          parent: editorRef.current!,
        });
      } catch (error) {
        console.error("Failed to init editor:", error);
        // Fallback to plain text
        if (!cancelled && editorRef.current) {
          const textarea = document.createElement("textarea");
          textarea.value = file?.content || "";
          textarea.className =
            "w-full h-full p-4 bg-transparent outline-none resize-none font-mono text-sm";
          textarea.style.color = "var(--app-text)";
          textarea.style.backgroundColor = "var(--app-bg)";
          textarea.addEventListener("input", (e) => {
            if (file)
              onContentChange(file.id, (e.target as HTMLTextAreaElement).value);
          });
          editorRef.current.innerHTML = "";
          editorRef.current.appendChild(textarea);
        }
      }
    }

    initEditor();

    return () => {
      cancelled = true;
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, [file?.id, isReady]);

  if (!isReady) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!file) {
    return (
      <div
        className="flex-1 flex items-center justify-center"
        style={{ direction: "ltr" }}
      >
        <div className="text-center space-y-4 px-6 max-w-md">
          <div className="text-6xl">📝</div>
          <h3
            className="text-xl font-bold"
            style={{ color: "var(--app-text)" }}
          >
            Open a file to start editing
          </h3>
          <p className="text-sm" style={{ color: "var(--app-text-muted)" }}>
            {isMobile
              ? "Tap a file in the explorer"
              : "Select a file from the explorer or create a new one"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={editorRef}
      className="flex-1 overflow-hidden"
      style={{ direction: "ltr", minHeight: isMobile ? "300px" : "auto" }}
      dir="ltr"
    />
  );
}
