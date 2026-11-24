import { FileCode2, CodeXml, Paintbrush, FileJson, FileText, Database, Terminal, Container } from "lucide-react";
// components/tools/developer/code-editor/types.ts

export interface VirtualFile {
  id: string;
  name: string;
  language: string;
  content: string;
  parentId: string | null;
  isFolder: boolean;
  createdAt: string;
  updatedAt: string;
  fileHandle?: any;
  dirHandle?: any;
}

export interface EditorTab {
  fileId: string;
  isDirty: boolean;
}

export const SUPPORTED_LANGUAGES = {
  javascript: { name: "JavaScript", ext: ".js", icon: FileCode2 },
  typescript: { name: "TypeScript", ext: ".ts", icon: FileCode2 },
  jsx: { name: "React JSX", ext: ".jsx", icon: CodeXml },
  tsx: { name: "React TSX", ext: ".tsx", icon: CodeXml },
  html: { name: "HTML", ext: ".html", icon: CodeXml },
  css: { name: "CSS", ext: ".css", icon: Paintbrush },
  scss: { name: "SCSS", ext: ".scss", icon: Paintbrush },
  json: { name: "JSON", ext: ".json", icon: FileJson },
  markdown: { name: "Markdown", ext: ".md", icon: FileText },
  python: { name: "Python", ext: ".py", icon: FileCode2 },
  php: { name: "PHP", ext: ".php", icon: FileCode2 },
  java: { name: "Java", ext: ".java", icon: FileCode2 },
  cpp: { name: "C++", ext: ".cpp", icon: FileCode2 },
  c: { name: "C", ext: ".c", icon: FileCode2 },
  csharp: { name: "C#", ext: ".cs", icon: FileCode2 },
  go: { name: "Go", ext: ".go", icon: FileCode2 },
  rust: { name: "Rust", ext: ".rs", icon: FileCode2 },
  sql: { name: "SQL", ext: ".sql", icon: Database },
  xml: { name: "XML", ext: ".xml", icon: CodeXml },
  yaml: { name: "YAML", ext: ".yml", icon: FileJson },
  shell: { name: "Shell", ext: ".sh", icon: Terminal },
  dockerfile: { name: "Dockerfile", ext: ".dockerfile", icon: Container },
  plaintext: { name: "Plain Text", ext: ".txt", icon: FileText },
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

export const STORAGE_KEY = "tm_code_editor_fs";
export const AUTO_SAVE_DELAY = 1000;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB for display, files are stored in memory
