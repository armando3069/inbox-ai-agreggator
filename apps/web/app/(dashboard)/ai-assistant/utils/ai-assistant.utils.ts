import type { ResponseTone } from "@/services/ai-assistant/ai-assistant.types";

export const TONE_OPTIONS: { value: ResponseTone; label: string; description: string }[] = [
  { value: "professional", label: "Professional",  description: "Clear, concise, and formal" },
  { value: "friendly",     label: "Friendly",      description: "Warm and helpful" },
  { value: "casual",       label: "Casual",        description: "Relaxed and conversational" },
  { value: "strict",       label: "Strict",        description: "Direct and minimal" },
];

// Shared style tokens used across ai-assistant components
export const CARD = "rounded-2xl border border-[var(--border-warm)] bg-[var(--bg-surface)] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)]";
export const ICON_BOX = "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F3F4F6]";
export const ICON = "h-[18px] w-[18px] text-[var(--text-secondary)]";
export const CARD_TITLE = "text-[14px] font-semibold text-[var(--text-primary)] leading-tight";
export const CARD_DESC = "mt-1 text-[13px] text-[var(--text-tertiary)] leading-relaxed";
export const PRIMARY_BTN = "inline-flex items-center gap-2 rounded-[var(--radius-button)] bg-[var(--accent-primary)] px-4 py-2 text-[13px] font-medium text-white hover:bg-[var(--accent-primary-hover)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 transition-all duration-150 ease-out shadow-[var(--shadow-xs)]";
export const TEXTAREA = "w-full rounded-xl border border-[var(--border-warm)] bg-[var(--bg-surface)] px-4 py-3 text-[13px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--text-tertiary)] resize-none transition-all duration-150 ease-out leading-relaxed";
