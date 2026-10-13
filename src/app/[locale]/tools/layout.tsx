import type { ReactNode } from "react";
import PageContainer from "@/components/layout/PageContainer";

export default function ToolsLayout({ children }: { children: ReactNode }) {
  return (
    <PageContainer
      as="div"
      width="full"
      spacing="none"
      gutter="none"
      withBackground={false}
      className="tool-layout-shell overflow-x-clip"
    >
      {children}
    </PageContainer>
  );
}
