export interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
}

export function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] p-5">
      <p className="text-[12px] text-[var(--text-tertiary)] font-medium mb-2">{label}</p>
      <p className="text-[28px] font-semibold text-[var(--text-primary)] leading-none">{value}</p>
      {sub && <p className="text-[11px] text-[var(--text-tertiary)] mt-1.5">{sub}</p>}
    </div>
  );
}
