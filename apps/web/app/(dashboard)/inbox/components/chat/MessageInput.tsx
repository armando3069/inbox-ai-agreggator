"use client";

import { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Paperclip, Smile, ArrowUp, Zap, Tag } from "lucide-react";
import { SuggestionsPanel } from "./SuggestionsPanel";
import { cn } from "@/lib/cn";

// Lazy-load to avoid SSR issues (emoji-mart accesses `window` at import time)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Picker = dynamic(() => import("@emoji-mart/react"), { ssr: false }) as any;

interface EmojiSelection {
  native: string;
}

interface MessageInputProps {
  value: string;
  suggestions: string[];
  isLoadingSuggestions: boolean;
  /** Controlled by parent — true when the suggestions panel is open */
  isSuggestionsOpen: boolean;
  onValueChange: (value: string) => void;
  /** Open panel + fetch (if closed) OR close panel (if open) */
  onToggleSuggestions: () => void;
  /** Close the panel only — used by the click-outside handler */
  onCloseSuggestions: () => void;
  onSend: () => void;
}

export function MessageInput({
  value,
  suggestions,
  isLoadingSuggestions,
  isSuggestionsOpen,
  onValueChange,
  onToggleSuggestions,
  onCloseSuggestions,
  onSend,
}: MessageInputProps) {
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);

  const wrapperRef     = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const textareaRef    = useRef<HTMLTextAreaElement>(null);

  const hasText = value.trim().length > 0;

  // Auto-grow textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [value]);

  // Close suggestions (and emoji picker) when clicking outside the composer
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        onCloseSuggestions();
        setIsEmojiOpen(false);
        return;
      }
      if (
        isEmojiOpen &&
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target as Node)
      ) {
        setIsEmojiOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isEmojiOpen, onCloseSuggestions]);

  // Insert emoji at cursor position
  const handleEmojiSelect = (emoji: EmojiSelection) => {
    const textarea = textareaRef.current;
    const char = emoji.native;

    if (!textarea) {
      onValueChange(value + char);
      return;
    }

    const start = textarea.selectionStart ?? value.length;
    const end   = textarea.selectionEnd   ?? value.length;
    const newValue = value.slice(0, start) + char + value.slice(end);
    onValueChange(newValue);

    setTimeout(() => {
      textarea.focus();
      const pos = start + char.length;
      textarea.setSelectionRange(pos, pos);
    }, 0);
  };

  return (
    <div ref={wrapperRef} className="px-4 py-3 border-t border-[var(--border-default)] bg-[var(--bg-surface)]">

      {/* ── AI Suggestions panel — slides in above composer ─────────── */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-200 ease-in-out",
          isSuggestionsOpen ? "max-h-64 opacity-100 mb-2" : "max-h-0 opacity-0 pointer-events-none"
        )}
      >
        <SuggestionsPanel
          suggestions={suggestions}
          isLoading={isLoadingSuggestions}
          onSelect={(s) => { onValueChange(s); }}
        />
      </div>

      {/* ── Composer card ────────────────────────────────────────────── */}
      <div className="relative rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] transition-shadow duration-150 focus-within:border-[var(--text-tertiary)]">

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder="Scrie un mesaj..."
          rows={1}
          className="w-full bg-transparent resize-none px-4 pt-3.5 pb-2 text-[14px] leading-relaxed text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none"
          style={{ minHeight: 44, maxHeight: 160 }}
        />

        {/* ── Bottom toolbar ───────────────────────────────────────── */}
        <div className="flex items-center justify-between px-2.5 pb-2.5 pt-1">

          {/* Left: action chips */}
          <div className="flex items-center gap-1">
            {/* Attachment */}
            <button
              className="flex items-center justify-center h-7 w-7 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] transition-all duration-120 ease-out"
              title="Attach file"
            >
              <Paperclip className="w-[15px] h-[15px]" />
            </button>

            {/* Divider */}
            <span className="w-px h-4 bg-[var(--border-default)] mx-1" />

            {/* Sugestii AI */}
            <button
              onClick={onToggleSuggestions}
              className={cn(
                "flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-[12px] font-medium transition-all duration-120 ease-out",
                isSuggestionsOpen
                  ? "bg-[var(--accent-primary)] text-white shadow-[var(--shadow-xs)]"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]"
              )}
            >
              <Zap className={cn("w-3 h-3", isSuggestionsOpen ? "fill-white" : "")} />
              Sugestii AI
            </button>

            {/* Auto-clasificare */}
            <button
              className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-[12px] font-medium text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] transition-all duration-120 ease-out"
            >
              <Tag className="w-3 h-3" />
              Auto-clasificare
            </button>
          </div>

          {/* Right: emoji + send */}
          <div className="flex items-center gap-1 relative">
            {/* Emoji toggle */}
            <button
              onClick={() => setIsEmojiOpen((p) => !p)}
              className={cn(
                "flex items-center justify-center h-7 w-7 rounded-lg transition-all duration-120 ease-out",
                isEmojiOpen
                  ? "bg-[var(--bg-surface-hover)] text-[var(--text-primary)]"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]"
              )}
            >
              <Smile className="w-[15px] h-[15px]" />
            </button>

            {/* Emoji picker */}
            {isEmojiOpen && (
              <div
                ref={emojiPickerRef}
                className="absolute bottom-full right-0 mb-2 z-50 shadow-[var(--shadow-dropdown)] rounded-xl overflow-hidden"
              >
                <Picker
                  data={async () => {
                    const { default: d } = await import("@emoji-mart/data");
                    return d;
                  }}
                  onEmojiSelect={handleEmojiSelect}
                  theme="light"
                  previewPosition="none"
                  skinTonePosition="none"
                />
              </div>
            )}

            {/* Send button — only visible when there's text */}
            <button
              onClick={onSend}
              disabled={!hasText}
              className={cn(
                "flex items-center justify-center h-7 w-7 rounded-lg transition-all duration-150 ease-out",
                hasText
                  ? "bg-[var(--accent-primary)] text-white shadow-[var(--shadow-xs)] hover:bg-[var(--accent-primary-hover)] active:scale-[0.94] scale-100 opacity-100"
                  : "bg-[var(--bg-surface-hover)] text-[var(--text-tertiary)] scale-90 opacity-50 cursor-not-allowed"
              )}
            >
              <ArrowUp className="w-[15px] h-[15px]" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
