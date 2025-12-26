import {
  FileStack,
  Image as ImageIcon,
  Braces,
  KeyRound,
  QrCode,
  Minimize2,
  Scaling,
  TextCursorInput,
  Scale,
  Binary,
  CalendarDays,
  Pipette,
  LucideIcon,
  ShieldCheck,
  FileCode,
  MonitorSmartphone,
  Globe,
  FileType,
  GitGraph,
  FileSpreadsheet,
  Edit3,
  PieChart,
  Sparkles,
  AudioLines,
  Presentation,
} from "lucide-react";

export interface Tool {
  id: string;
  Icon: LucideIcon;
  href: string;
  status: "active" | "coming-soon";
  category:
    | "pdf"
    | "image"
    | "developer"
    | "security"
    | "utility"
    | "system"
    | "excel"
    | "audio"
    | "powerpoint";
  badgeKey?: string;
}

export const TOOLS: Tool[] = [
  // --- Most Used / Daily Tools ---

  {
    id: "image-compressor",
    Icon: Minimize2,
    href: "/tools/image-compressor",
    status: "active",
    category: "image",
    badgeKey: "tools.items.image-compressor.badge",
  },
  {
    id: "image-to-pdf",
    Icon: ImageIcon,
    href: "/tools/image-to-pdf",
    status: "active",
    category: "image",
    badgeKey: "tools.items.image-to-pdf.badge",
  },
  {
    id: "pdf-merge",
    Icon: FileStack,
    href: "/tools/pdf-merge",
    status: "active",
    category: "pdf",
    badgeKey: "tools.items.pdf-merge.badge",
  },
  {
    id: "background-remover",
    Icon: FileStack,
    href: "/tools/background-remover",
    status: "active",
    category: "image",
    badgeKey: "tools.items.background-remover.badge",
  },
  {
    id: "word-to-pdf",
    Icon: FileType,
    href: "/tools/word-to-pdf",
    status: "active",
    category: "pdf",
    badgeKey: "tools.items.word-to-pdf.badge",
  },
  {
    id: "text-to-pdf",
    Icon: FileType,
    href: "/tools/text-to-pdf",
    status: "active",
    category: "pdf",
    badgeKey: "tools.items.text-to-pdf.badge",
  },
  {
    id: "pdf-editor",
    Icon: FileStack,
    href: "/tools/pdf-editor",
    status: "active",
    category: "pdf",
    badgeKey: "tools.items.pdf-editor.badge",
  },
  {
    id: "qr-gen",
    Icon: QrCode,
    href: "/tools/qr-generator",
    status: "active",
    category: "utility",
    badgeKey: "tools.items.qr-gen.badge",
  },
  {
    id: "audio-extractor",
    Icon: AudioLines,
    href: "/tools/audio-extractor",
    status: "active",
    category: "audio",
    badgeKey: "tools.items.audio-extractor.badge",
  },
  {
    id: "image-editor",
    Icon: Sparkles,
    href: "/tools/image-editor",
    status: "active",
    category: "image",
    badgeKey: "tools.items.image-editor.badge",
  },
  {
    id: "word-counter",
    Icon: TextCursorInput,
    href: "/tools/word-counter",
    status: "active",
    category: "utility",
    badgeKey: "tools.items.word-counter.badge",
  },

  // --- Visual / Media Tools ---

  {
    id: "image-resizer",
    Icon: Scaling,
    href: "/tools/image-resizer",
    status: "active",
    category: "image",
    badgeKey: "tools.items.image-resizer.badge",
  },
  {
    id: "image-converter",
    Icon: ImageIcon,
    href: "/tools/image-converter",
    status: "active",
    category: "image",
    badgeKey: "tools.items.image-converter.badge",
  },
  {
    id: "image-to-svg",
    Icon: ImageIcon,
    href: "/tools/image-to-svg",
    status: "active",
    category: "image",
    badgeKey: "tools.items.image-to-svg.badge",
  },
  {
    id: "color-picker",
    Icon: Pipette,
    href: "/tools/color-picker",
    status: "active",
    category: "image",
    badgeKey: "tools.items.color-picker.badge",
  },

  // --- Office / Document / Data ---

  {
    id: "excel-viewer",
    Icon: FileSpreadsheet,
    href: "/tools/excel-viewer",
    status: "active",
    category: "excel",
    badgeKey: "tools.items.excel-viewer.badge",
  },
  {
    id: "excel-editor",
    Icon: Edit3,
    href: "/tools/excel-editor",
    status: "active",
    category: "excel",
    badgeKey: "tools.items.excel-editor.badge",
  },
  {
    id: "excel-chart",
    Icon: PieChart,
    href: "/tools/excel-chart",
    status: "active",
    category: "excel",
    badgeKey: "tools.items.excel-chart.badge",
  },
  {
    id: "html-to-pptx",
    Icon: Presentation,
    href: "/tools/html-to-pptx",
    status: "active",
    category: "powerpoint",
    badgeKey: "tools.items.html-to-pptx.badge",
  },

  // --- Utility / System ---

  {
    id: "unit-converter",
    Icon: Scale,
    href: "/tools/unit-converter",
    status: "active",
    category: "utility",
    badgeKey: "tools.items.unit-converter.badge",
  },
  {
    id: "date-converter",
    Icon: CalendarDays,
    href: "/tools/date-converter",
    status: "active",
    category: "utility",
    badgeKey: "tools.items.date-converter.badge",
  },
  {
    id: "ip-checker",
    Icon: Globe,
    href: "/tools/ip-checker",
    status: "active",
    category: "system",
    badgeKey: "tools.items.ip-checker.badge",
  },
  {
    id: "user-agent",
    Icon: MonitorSmartphone,
    href: "/tools/user-agent",
    status: "active",
    category: "system",
    badgeKey: "tools.items.user-agent.badge",
  },

  // --- Security ---

  {
    id: "password-generator",
    Icon: KeyRound,
    href: "/tools/password-generator",
    status: "active",
    category: "security",
    badgeKey: "tools.items.password-generator.badge",
  },
  {
    id: "hash-generator",
    Icon: ShieldCheck,
    href: "/tools/hash-generator",
    status: "active",
    category: "security",
    badgeKey: "tools.items.hash-generator.badge",
  },
  {
    id: "exif-remover",
    Icon: ShieldCheck,
    href: "/tools/exif-remover",
    status: "active",
    category: "security",
    badgeKey: "tools.items.exif-remover.badge",
  },

  // --- Developer Tools (Specialized users) ---

  {
    id: "json-formatter",
    Icon: Braces,
    href: "/tools/json-formatter",
    status: "active",
    category: "developer",
    badgeKey: "tools.items.json-formatter.badge",
  },
  {
    id: "base64",
    Icon: Binary,
    href: "/tools/base64",
    status: "active",
    category: "developer",
    badgeKey: "tools.items.base64.badge",
  },
  {
    id: "markdown-preview",
    Icon: FileCode,
    href: "/tools/markdown-preview",
    status: "active",
    category: "developer",
    badgeKey: "tools.items.markdown-preview.badge",
  },
  {
    id: "code-visualizer",
    Icon: GitGraph,
    href: "/tools/code-visualizer",
    status: "active",
    category: "developer",
    badgeKey: "tools.items.code-visualizer.badge",
  },

  // --- Audio (Niche) ---

  {
    id: "audio-editor",
    Icon: AudioLines,
    href: "/tools/audio-editor",
    status: "active",
    category: "audio",
    badgeKey: "tools.items.audio-editor.badge",
  },
];
