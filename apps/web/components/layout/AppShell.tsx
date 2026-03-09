"use client";

import { SidebarProvider } from "@/context/SidebarContext";
import { AppSidebar } from "./AppSidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <SidebarProvider>
      <div className="h-screen bg-[var(--under-bg)] p-2">
        <div className="h-full bg-[var(--sidebar-bg)] rounded-[var(--radius-card)] shadow-[var(--shadow-elevated)] overflow-hidden flex border border-[var(--border-subtle)]">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden p-2">
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
