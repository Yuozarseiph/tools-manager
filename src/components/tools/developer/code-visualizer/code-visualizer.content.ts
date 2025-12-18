// app/tools/(developer)/code-visualizer/code-visualizer.content.ts

import { useLanguage } from "@/context/LanguageContext";

export const codeVisualizerContent = {
  fa: {
    id: "code-visualizer",
    category: "developer",
    title: "بصری‌سازی ساختار کد",
    description: "کد جاوااسکریپت یا سی‌شارپ خود را به یک نمودار گرافی تبدیل کنید تا وابستگی‌ها و ساختار آن را بهتر درک کنید.",
    features: [
      "پشتیبانی از زبان‌های JavaScript/TypeScript و C#",
      "تحلیل خودکار توابع، کلاس‌ها و ارتباطات آن‌ها",
      "دو حالت چینش گراف: سلسله‌مراتبی و درختی",
      "بهینه‌سازی برای دسکتاپ و موبایل با حالت فشرده"
    ],
    ui: {
      header: {
        title: "بصری‌سازی کد",
        subtitleJs: "کد JavaScript/TypeScript را وارد کنید تا ساختار آن به صورت یک گراف قابل تعامل نمایش داده شود.",
        subtitleCsharp: "کد C# خود را وارد کنید تا کلاس‌ها، متدها و ارتباطات آن‌ها را در قالب گراف ببینید."
      },
      languageToggle: {
        js: "JavaScript / TS",
        csharp: "C#"
      },
      layout: {
        hierarchical: "چینش سلسله‌مراتبی",
        tree: "چینش درختی",
        compact: "حالت فشرده"
      },
      actions: {
        loadExample: "کد نمونه",
        refresh: "بازسازی گراف",
        fullscreen: "تمام‌صفحه",
        exitFullscreen: "خروج از تمام‌صفحه"
      },
      stats: {
        nodes: "گره‌ها",
        edges: "یال‌ها",
        depth: "عمق گراف",
        status: "وضعیت تحلیل",
        statusProcessing: "در حال تحلیل و ساخت گراف...",
        statusReady: "گراف آماده است.",
        statusEmpty: "منتظر دریافت کد برای تحلیل.",
        statusPromptMobile: "کد را وارد کنید تا گراف ساخته شود.",
        summaryPrefix: "خلاصه گراف: ",
        summaryNodesSuffix: "گره",
        summaryEdgesSuffix: "ارتباط"
      },
      editor: {
        title: "ویرایشگر کد",
        placeholderJs: "// کد JavaScript یا TypeScript خود را اینجا قرار دهید...",
        placeholderCsharp: "// کد C# خود را اینجا قرار دهید...",
        modeBadgeJs: "حالت JavaScript / TypeScript",
        modeBadgeCsharp: "حالت C#",
        linesSuffix: "خط",
        hintTitle: "راهنما:",
        hintJs: "ساختارهایی مثل کلاس، توابع، async/await و فراخوانی متدها بهتر شناسایی می‌شوند.",
        hintCsharp: "کلاس‌ها، متدهای public/private و فراخوانی متدهای async شناسایی می‌شوند.",
        debounceDesktop: "تحلیل خودکار چند لحظه بعد از توقف تایپ انجام می‌شود.",
        debounceMobile: "روی موبایل، برای عملکرد بهتر ممکن است تحلیل کمی با تأخیر انجام شود."
      },
      graph: {
        building: "در حال ساخت و به‌روزرسانی گراف...",
        emptyTitleMobile: "برای شروع، کدی وارد کنید.",
        emptyTitleDesktop: "منتظر کد برای ساخت گراف",
        emptyDescription: "هنوز گره‌ای برای نمایش وجود ندارد. کد معتبر وارد کنید تا ساختار آن در قالب گراف نمایش داده شود.",
        backToEditorMobile: "بازگشت به ویرایشگر کد",
        statusEmpty: "گرافی برای نمایش وجود ندارد.",
        statusWithNodesPrefix: "گراف شامل ",
        statusNodesSuffix: "گره شناسایی‌شده است.",
        dragHint: "می‌توانید گراف را بکشید، بزرگ‌نمایی و کوچک‌نمایی کنید."
      },
      mobile: {
        toggleEditor: "نمایش ویرایشگر",
        toggleGraph: "نمایش گراف",
        betterOnDesktop: "برای تجربه بهتر و مشاهده گراف‌های بزرگ، استفاده از دسکتاپ پیشنهاد می‌شود."
      },
      tips: {
        title: "نکات استفاده بهتر",
        items: [
          "از بلاک‌های کوچک‌تر کد استفاده کنید تا گراف خواناتر شود.",
          "در صورت شلوغ شدن گراف، حالت فشرده (Compact) را فعال کنید.",
          "چینش درختی برای ساختارهای سلسله‌مراتبی عمیق مناسب‌تر است.",
          "در صورت تغییر زیاد در کد، دکمه «بازسازی گراف» را به صورت دستی بزنید."
        ]
      },
      page: {
        title: "ابزار بصری‌سازی ساختار کد",
        description: "ساختار داخلی کد خود را با نمودار گرافی تعاملی بررسی کنید و ارتباط بین اجزا را بهتر درک کنید."
      }
    }
  },
  en: {
    id: "code-visualizer",
    category: "developer",
    title: "Code structure visualizer",
    description: "Turn your JavaScript or C# code into an interactive graph to explore its structure and relationships.",
    features: [
      "Supports JavaScript/TypeScript and C# code",
      "Automatically extracts classes, functions and relationships",
      "Two layout modes: hierarchical and tree",
      "Desktop and mobile friendly with compact view"
    ],
    ui: {
      header: {
        title: "Code visualizer",
        subtitleJs: "Paste your JavaScript/TypeScript code to see its structure as an interactive graph.",
        subtitleCsharp: "Paste your C# code to visualize classes, methods and their relationships."
      },
      languageToggle: {
        js: "JavaScript / TS",
        csharp: "C#"
      },
      layout: {
        hierarchical: "Hierarchical layout",
        tree: "Tree layout",
        compact: "Compact mode"
      },
      actions: {
        loadExample: "Load example",
        refresh: "Rebuild graph",
        fullscreen: "Fullscreen",
        exitFullscreen: "Exit fullscreen"
      },
      stats: {
        nodes: "Nodes",
        edges: "Edges",
        depth: "Graph depth",
        status: "Analysis status",
        statusProcessing: "Analyzing code and building graph...",
        statusReady: "Graph is ready.",
        statusEmpty: "Waiting for code to analyze.",
        statusPromptMobile: "Enter some code to build the graph.",
        summaryPrefix: "Graph summary: ",
        summaryNodesSuffix: "nodes",
        summaryEdgesSuffix: "edges"
      },
      editor: {
        title: "Code editor",
        placeholderJs: "// Paste your JavaScript or TypeScript code here...",
        placeholderCsharp: "// Paste your C# code here...",
        modeBadgeJs: "JavaScript / TypeScript mode",
        modeBadgeCsharp: "C# mode",
        linesSuffix: "lines",
        hintTitle: "Hint:",
        hintJs: "Classes, functions, async/await and method calls are better recognized.",
        hintCsharp: "Classes, public/private methods and async calls are extracted.",
        debounceDesktop: "Analysis runs automatically a short moment after you stop typing.",
        debounceMobile: "On mobile, analysis may run with a slight delay for better performance."
      },
      graph: {
        building: "Building and updating the graph...",
        emptyTitleMobile: "Start by entering some code.",
        emptyTitleDesktop: "Waiting for code to build a graph",
        emptyDescription: "There are no nodes to show yet. Paste valid code and the graph will appear here.",
        backToEditorMobile: "Back to code editor",
        statusEmpty: "No graph to display.",
        statusWithNodesPrefix: "Graph contains ",
        statusNodesSuffix: "detected nodes.",
        dragHint: "You can drag, zoom in and zoom out the graph."
      },
      mobile: {
        toggleEditor: "Show editor",
        toggleGraph: "Show graph",
        betterOnDesktop: "For large graphs, using a desktop device provides a better experience."
      },
      tips: {
        title: "Tips for better results",
        items: [
          "Use smaller code chunks to keep the graph readable.",
          "Enable compact mode if the graph becomes too crowded.",
          "Tree layout works better for deeply nested structures.",
          "When you change a lot of code, click “Rebuild graph” manually."
        ]
      },
      page: {
        title: "Code structure visualizer tool",
        description: "Explore the internal structure of your code with an interactive graph of its components and relationships."
      }
    }
  }
};

export type CodeVisualizerToolContent = typeof codeVisualizerContent.fa;

export function useCodeVisualizerContent() {
  const { locale } = useLanguage();
  return codeVisualizerContent[locale];
}
