// types/docs.ts
import { LucideIcon } from "lucide-react";

export interface DocSectionItem {
  id: string;
  title: string;
  category: string;
  icon: LucideIcon;
  description: string;
  technicalNote?: {
    title: string;
    content: string;
  };
  features: string[];
  privacyNote?: string;
  howItWorks?: string[];
}
