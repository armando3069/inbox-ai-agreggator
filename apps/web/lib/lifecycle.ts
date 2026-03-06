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
  { value: "NEW_LEAD",  label: "New Lead",  emoji: "🆕", group: "active", badgeClass: "bg-blue-100 text-blue-700 border-blue-200"    },
  { value: "HOT_LEAD",  label: "Hot Lead",  emoji: "🔥", group: "active", badgeClass: "bg-red-100 text-red-700 border-red-200"      },
  { value: "PAYMENT",   label: "Payment",   emoji: "💰", group: "active", badgeClass: "bg-green-100 text-green-700 border-green-200"  },
  { value: "CUSTOMER",  label: "Customer",  emoji: "🤩", group: "active", badgeClass: "bg-purple-100 text-purple-700 border-purple-200"},
  { value: "COLD_LEAD", label: "Cold Lead", emoji: "🧊", group: "lost",   badgeClass: "bg-slate-100 text-slate-500 border-slate-200"  },
];


export function getLifecycleStage(status?: string | null): LifecycleStage {
  return LIFECYCLE_STAGES.find((s) => s.value === status) ?? LIFECYCLE_STAGES[0];
}
