import { TelegramIcon, WhatsAppIcon, MessengerIcon, EmailIcon } from "./BrandIcons";

export function EmptyConfigPanel() {
  return (
    <div className="flex min-h-[340px] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--bg-surface-hover)]/50 px-8 py-12 text-center">
      {/* Platform icon trio */}
      <div className="mb-5 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-warm)] bg-[var(--bg-surface)] shadow-[var(--shadow-sm)]">
          <span className="text-sky-500 dark:text-sky-400"><TelegramIcon /></span>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-warm)] bg-[var(--bg-surface)] shadow-[var(--shadow-card)]">
          <span className="text-emerald-600 dark:text-emerald-400"><WhatsAppIcon /></span>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-warm)] bg-[var(--bg-surface)] shadow-[var(--shadow-sm)]">
          <span className="text-blue-500 dark:text-blue-400"><MessengerIcon /></span>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-warm)] bg-[var(--bg-surface)] shadow-[var(--shadow-sm)]">
          <span className="text-orange-500 dark:text-orange-400"><EmailIcon /></span>
        </div>
      </div>

      <p className="text-[14px] font-semibold text-[var(--text-primary)] leading-tight">
          No platform selected
      </p>
      <p className="mt-2 max-w-[220px] text-[13px] text-[var(--text-secondary)] leading-relaxed">
          Choose a platform from the left to configure the integration.
      </p>
    </div>
  );
}
