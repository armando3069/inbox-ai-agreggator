import { Zap } from "lucide-react";

interface SuggestionsPanelProps {
  suggestions: string[];
  isLoading?: boolean;
  onSelect: (suggestion: string) => void;
}

export function SuggestionsPanel({ suggestions, isLoading, onSelect }: SuggestionsPanelProps) {
  return (
    <div className="p-3 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-default)] shadow-[0_1px_4px_0_rgba(0,0,0,0.06)]">
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-2.5 px-0.5">
        <div className="flex items-center justify-center h-5 w-5 rounded-md bg-[var(--accent-primary)]/10">
          <Zap className="w-3 h-3 text-[var(--accent-primary)]" />
        </div>
        <span className="text-[12px] font-semibold text-[var(--text-primary)]">Răspunsuri Sugerate</span>
        {isLoading && (
          <span className="text-[11px] text-[var(--text-tertiary)] ml-auto animate-pulse">
            Se generează...
          </span>
        )}
      </div>

      {/* Suggestions grid */}
      <div className="flex flex-col gap-1.5">
        {isLoading
          ? [0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-8 bg-[var(--bg-surface-hover)] rounded-xl animate-pulse"
              />
            ))
          : suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => onSelect(suggestion)}
                className="text-left px-3 py-2 bg-[var(--bg-surface-hover)] hover:bg-[var(--accent-primary)]/[0.06] rounded-xl text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent hover:border-[var(--accent-primary)]/10 transition-all duration-120 ease-out leading-relaxed"
              >
                {suggestion}
              </button>
            ))}
      </div>
    </div>
  );
}
