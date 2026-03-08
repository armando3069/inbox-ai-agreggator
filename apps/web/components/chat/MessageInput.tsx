"use client";

import { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Paperclip, Smile, Send, Zap, Tag } from "lucide-react";
import { SuggestionsPanel } from "./SuggestionsPanel";

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

  const wrapperRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Insert the selected emoji at the current cursor position
  const handleEmojiSelect = (emoji: EmojiSelection) => {
    const textarea = textareaRef.current;
    const char = emoji.native;

    if (!textarea) {
      onValueChange(value + char);
      return;
    }

    const start = textarea.selectionStart ?? value.length;
    const end = textarea.selectionEnd ?? value.length;
    const newValue = value.slice(0, start) + char + value.slice(end);
    onValueChange(newValue);

    setTimeout(() => {
      textarea.focus();
      const pos = start + char.length;
      textarea.setSelectionRange(pos, pos);
    }, 0);
  };

  return (
    <div ref={wrapperRef} className="px-5 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      {/* Suggestions panel — smooth collapse/expand */}
      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          isSuggestionsOpen ? "max-h-56 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <SuggestionsPanel
          suggestions={suggestions}
          isLoading={isLoadingSuggestions}
          onSelect={(s) => {
            onValueChange(s);
            // Keep panel open so the agent can pick another or edit
          }}
        />
      </div>

      <div className="flex items-end gap-2.5">
        <button className="p-2 hover:bg-[var(--bg-surface-hover)] rounded-[var(--radius-badge)] transition-colors">
          <Paperclip className="w-4.5 h-4.5 text-[var(--text-tertiary)]" />
        </button>

        {/* Textarea + emoji button share a relative container */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            placeholder="Scrie un mesaj..."
            className="w-full p-3 pr-10 border border-[var(--border-default)] rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/10 focus:border-[var(--accent-primary)]/30 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] text-[14px]"
            rows={2}
          />

          {/* Emoji toggle button */}
          <button
            className={`absolute right-3 bottom-3 p-1 rounded-[var(--radius-badge)] transition-colors ${
              isEmojiOpen ? "bg-[var(--bg-surface-hover)] text-[var(--text-primary)]" : "hover:bg-[var(--bg-surface-hover)] text-[var(--text-tertiary)]"
            }`}
            onClick={() => setIsEmojiOpen((prev) => !prev)}
          >
            <Smile className="w-4.5 h-4.5" />
          </button>

          {/* Emoji picker popover — appears above the composer, right-aligned */}
          {isEmojiOpen && (
            <div
              ref={emojiPickerRef}
              className="absolute bottom-full right-0 mb-2 z-50 shadow-[var(--shadow-dropdown)] rounded-[var(--radius-button)] overflow-hidden"
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
        </div>

        <button
          className="p-3 bg-[var(--accent-primary)] hover:bg-[#222] text-white rounded-[var(--radius-button)] transition-colors"
          onClick={onSend}
        >
          <Send className="w-4.5 h-4.5" />
        </button>
      </div>

      <div className="flex items-center justify-between mt-2 px-1">
        <div className="flex items-center gap-3 text-[11px] text-[var(--text-tertiary)]">

          {/* "Sugestii AI" toggle button — active state shows dark chip */}
          <button
            onClick={onToggleSuggestions}
            className={`flex items-center gap-1 transition-colors rounded-md px-1.5 py-0.5 ${
              isSuggestionsOpen
                ? "text-[var(--text-primary)] bg-[var(--bg-surface-hover)] font-medium"
                : "hover:text-[var(--text-primary)]"
            }`}
          >
            <Zap className={`w-3 h-3 ${isSuggestionsOpen ? "fill-[var(--text-primary)]" : ""}`} />
            Sugestii AI
          </button>

          <button className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1">
            <Tag className="w-3 h-3" />
            Auto-clasificare
          </button>
        </div>
      </div>
    </div>
  );
}
