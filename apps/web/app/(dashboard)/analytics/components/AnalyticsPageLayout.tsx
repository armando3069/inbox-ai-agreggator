import { ReactNode } from "react";

export interface AnalyticsPageLayoutProps {
  children: ReactNode;
}

export function AnalyticsPageLayout({ children }: AnalyticsPageLayoutProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden rounded-xl bg-[var(--bg-surface)] shadow-[var(--shadow-card)] border border-[var(--border-default)]">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {children}
      </div>
    </div>
  );
}
