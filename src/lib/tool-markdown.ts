import { TOOLS } from "@/data/tools";
import { guideData, networkNote, toolInfo } from "./tool-guide";
import type { Locale } from "./locale-detection";
export function toolMarkdown(slug: string, locale: Locale) {
  const tool = TOOLS.find(item => item.href === `/tools/${slug}`)!;
  const guide = guideData(tool, locale);
  const fa = locale === "fa";
  return [`# ${guide.name}`, "", guide.description, "", `https://qodeforge.ir/${locale}${tool.href}`, "",
    `## ${fa ? "روش استفاده" : "How to use"}`, ...guide.steps.map((step, i) => `${i + 1}. ${step}`), "",
    `## ${fa ? "ویژگی‌ها" : "Features"}`, ...(guide.doc?.features ?? [guide.description]).map(feature => `- ${feature}`), "",
    `## ${fa ? "محدودیت‌ها" : "Limitations"}`, guide.limit, "",
    `## ${fa ? "حریم خصوصی و شبکه" : "Privacy and network"}`, networkNote(tool, locale), "",
    `## ${fa ? "پرسش‌های متداول" : "FAQ"}`, ...guide.faq.flatMap(([q, a]) => [`### ${q}`, a, ""]),
    `## ${fa ? "ابزارهای مرتبط" : "Related tools"}`, ...guide.related.map(other => `- [${toolInfo(other, locale).name}](https://qodeforge.ir/${locale}${other.href})`), "",
  ].join("\n");
}
