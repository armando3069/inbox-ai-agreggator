import { CheckCircle2 } from "lucide-react";

export interface ToastProps {
  message: string | null;
  variant?: "success" | "error";
}

export function Toast({ message, variant = "success" }: ToastProps) {
  if (!message) return null;

  if (variant === "success") {
    return (
      <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-medium text-emerald-700 shadow-[var(--shadow-dropdown)] dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-400">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        {message}
      </div>
    );
  }

  return (
    <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700 shadow-[var(--shadow-dropdown)] dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400">
      {message}
    </div>
  );
}
