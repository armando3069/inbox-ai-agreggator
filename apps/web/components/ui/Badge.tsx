import { getLifecycleStage } from "@/lib/lifecycle";
import { cn } from "@/lib/cn";

// ── PlatformBadge ─────────────────────────────────────────────────────────────

export function PlatformBadge({ platform }: { platform: string }) {
  const styles: Record<string, string> = {
    telegram: "bg-sky-50 text-sky-600 border-sky-100 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-900/60",
    whatsapp: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900/60",
    teams:    "bg-violet-50 text-violet-600 border-violet-100 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-900/60",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-[3px] rounded-[var(--radius-badge)] border text-[11px] font-medium capitalize leading-none",
        styles[platform] ?? "bg-gray-50 text-gray-500 border-gray-100 dark:bg-gray-900/50 dark:text-gray-400 dark:border-gray-800/60"
      )}
    >
      {platform}
    </span>
  );
}

// ── LifecycleBadge ────────────────────────────────────────────────────────────

export function LifecycleBadge({ status }: { status: string }) {
  const stage = getLifecycleStage(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-[3px] rounded-[var(--radius-badge)] border text-[11px] font-medium leading-none",
        stage.badgeClass
      )}
    >
      <span className="text-[10px]">{stage.emoji}</span>
      {stage.label}
    </span>
  );
}
