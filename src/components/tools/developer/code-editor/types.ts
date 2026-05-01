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
  javascript: { name: "JavaScript", ext: ".js", icon: "📜" },
  typescript: { name: "TypeScript", ext: ".ts", icon: "📘" },
  jsx: { name: "React JSX", ext: ".jsx", icon: "⚛️" },
  tsx: { name: "React TSX", ext: ".tsx", icon: "⚛️" },
  html: { name: "HTML", ext: ".html", icon: "🌐" },
  css: { name: "CSS", ext: ".css", icon: "🎨" },
  scss: { name: "SCSS", ext: ".scss", icon: "💅" },
  json: { name: "JSON", ext: ".json", icon: "📋" },
  markdown: { name: "Markdown", ext: ".md", icon: "📝" },
  python: { name: "Python", ext: ".py", icon: "🐍" },
  php: { name: "PHP", ext: ".php", icon: "🐘" },
  java: { name: "Java", ext: ".java", icon: "☕" },
  cpp: { name: "C++", ext: ".cpp", icon: "⚡" },
  c: { name: "C", ext: ".c", icon: "⚡" },
  csharp: { name: "C#", ext: ".cs", icon: "💻" },
  go: { name: "Go", ext: ".go", icon: "🔵" },
  rust: { name: "Rust", ext: ".rs", icon: "🦀" },
  sql: { name: "SQL", ext: ".sql", icon: "🗄️" },
  xml: { name: "XML", ext: ".xml", icon: "📰" },
  yaml: { name: "YAML", ext: ".yml", icon: "📄" },
  shell: { name: "Shell", ext: ".sh", icon: "🐚" },
  dockerfile: { name: "Dockerfile", ext: ".dockerfile", icon: "🐳" },
  plaintext: { name: "Plain Text", ext: ".txt", icon: "📃" },
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

export const STORAGE_KEY = "tm_code_editor_fs";
export const AUTO_SAVE_DELAY = 1000;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB for display, files are stored in memory
