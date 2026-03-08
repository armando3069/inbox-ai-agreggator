import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ icon: Icon, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="h-5 w-5 text-[var(--text-tertiary)]" />}
        <div>
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h1>
          {description && (
            <p className="text-[13px] text-[var(--text-tertiary)]">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}
