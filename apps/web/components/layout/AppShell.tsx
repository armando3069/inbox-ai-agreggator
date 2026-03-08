"use client";

import { SidebarProvider } from "@/context/SidebarContext";
import { AppSidebar } from "./AppSidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <SidebarProvider>
      <div className="h-screen bg-[var(--bg-page)] p-3">
        <div className="h-full bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] overflow-hidden flex">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
