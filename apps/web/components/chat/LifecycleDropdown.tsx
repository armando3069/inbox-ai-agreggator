"use client";

import { useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useClickOutside } from "@/hooks/useClickOutside";
import { LIFECYCLE_STAGES, getLifecycleStage } from "@/lib/lifecycle";

export function LifecycleDropdown({
  current,
  onSelect,
}: {
  current: string;
  onSelect: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const stage = getLifecycleStage(current);

  useClickOutside(ref, () => setIsOpen(false), isOpen);

  const activeStages = LIFECYCLE_STAGES.filter((s) => s.group === "active");
  const lostStages   = LIFECYCLE_STAGES.filter((s) => s.group === "lost");

  const handleSelect = (value: string) => {
    setIsOpen(false);
    onSelect(value);
  };

  return (
    <div ref={ref} className="relative">
      {/* Badge / trigger */}
      <button
        onClick={() => setIsOpen((p) => !p)}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[14px] font-medium transition-all ${stage.badgeClass} hover:opacity-80`}
      >
        <span>{stage.emoji}</span>
        <span>{stage.label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden py-1">
          <div className="px-3 pt-2 pb-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Lifecycle Stages
            </p>
          </div>
          {activeStages.map((s) => (
            <button
              key={s.value}
              onClick={() => handleSelect(s.value)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                s.value === current
                  ? "bg-slate-50 font-medium text-slate-800"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>{s.emoji}</span>
              <span className="flex-1 text-left">{s.label}</span>
              {s.value === current && <Check className="w-3 h-3 text-slate-400" />}
            </button>
          ))}

          <div className="border-t border-slate-100 my-1" />
          <div className="px-3 pb-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Lost Stages
            </p>
          </div>
          {lostStages.map((s) => (
            <button
              key={s.value}
              onClick={() => handleSelect(s.value)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                s.value === current
                  ? "bg-slate-50 font-medium text-slate-800"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>{s.emoji}</span>
              <span className="flex-1 text-left">{s.label}</span>
              {s.value === current && <Check className="w-3 h-3 text-slate-400" />}
            </button>
          ))}
          <div className="h-1" />
        </div>
      )}
    </div>
  );
}
