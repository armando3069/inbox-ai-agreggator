"use client";

import * as Checkbox from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export interface PremiumCheckboxProps {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  indeterminate?: boolean;
}

export function PremiumCheckbox({
  checked,
  onCheckedChange,
  indeterminate,
}: PremiumCheckboxProps) {
  return (
    <Checkbox.Root
      checked={indeterminate ? "indeterminate" : checked}
      onCheckedChange={(v) => onCheckedChange(v === true)}
      className={cn(
        "flex h-[15px] w-[15px] items-center justify-center rounded-[4px] border transition-all duration-120 ease-out",
        checked || indeterminate
          ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]"
          : "border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--text-tertiary)]"
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <Checkbox.Indicator>
        {indeterminate ? (
          <div className="h-[1.5px] w-2 rounded-full bg-white" />
        ) : (
          <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
        )}
      </Checkbox.Indicator>
    </Checkbox.Root>
  );
}
