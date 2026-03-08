export type LifecycleStatus =
  | "NEW_LEAD"
  | "HOT_LEAD"
  | "PAYMENT"
  | "CUSTOMER"
  | "COLD_LEAD";

export interface LifecycleStage {
  value: LifecycleStatus;
  label: string;
  emoji: string;
  group: "active" | "lost";
  badgeClass: string;
}

export const LIFECYCLE_STAGES: LifecycleStage[] = [
  { value: "NEW_LEAD",  label: "New Lead",  emoji: "🆕", group: "active", badgeClass: "bg-sky-50 text-sky-700 border-sky-100"        },
  { value: "HOT_LEAD",  label: "Hot Lead",  emoji: "🔥", group: "active", badgeClass: "bg-orange-50 text-orange-700 border-orange-100" },
  { value: "PAYMENT",   label: "Payment",   emoji: "💰", group: "active", badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  { value: "CUSTOMER",  label: "Customer",  emoji: "🤩", group: "active", badgeClass: "bg-violet-50 text-violet-700 border-violet-100" },
  { value: "COLD_LEAD", label: "Cold Lead", emoji: "🧊", group: "lost",   badgeClass: "bg-stone-50 text-stone-500 border-stone-200"   },
];


export function getLifecycleStage(status?: string | null): LifecycleStage {
  return LIFECYCLE_STAGES.find((s) => s.value === status) ?? LIFECYCLE_STAGES[0];
}
