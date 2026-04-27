"use client";

import { useState } from "react";
import {
  Bot,
  Send,
  Loader2,
  ChevronDown,
  SlidersHorizontal,
  ShieldCheck,
  Check,
} from "lucide-react";
import { aiAssistantService } from "@/services/ai-assistant/ai-assistant.service";
import type { ResponseTone } from "@/services/ai-assistant/ai-assistant.types";
import type { UseAiConfigReturn } from "@/app/(dashboard)/ai-assistant/hooks/useAiConfig";
import { Toggle } from "@/components/ui/Toggle";
import { ConfidenceSlider } from "@/app/(dashboard)/ai-assistant/components/ConfidenceSlider";
import {
  TONE_OPTIONS,
  CARD,
  ICON_BOX,
  ICON,
  CARD_TITLE,
  CARD_DESC,
  PRIMARY_BTN,
  TEXTAREA,
} from "@/app/(dashboard)/ai-assistant/utils/ai-assistant.utils";

// ── ToneSelector (local, not reused elsewhere) ────────────────────────────────

function ToneSelector({
  value,
  onChange,
  disabled,
}: {
  value: ResponseTone;
  onChange: (v: ResponseTone) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = TONE_OPTIONS.find((o) => o.value === value) ?? TONE_OPTIONS[0];

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-2.5 text-[13px] text-[var(--text-primary)] transition-all duration-150 ease-out hover:border-[var(--text-tertiary)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
      >
        <div className="text-left">
          <span className="font-medium">{selected.label}</span>
          <span className="ml-2 text-[var(--text-tertiary)]">— {selected.description}</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[var(--text-tertiary)] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          {/* Backdrop to close */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-dropdown)]">
            {TONE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left text-[13px] transition-colors duration-150 ease-out hover:bg-[var(--bg-surface-hover)] ${
                  opt.value === value ? "bg-[var(--bg-surface-hover)]" : ""
                }`}
              >
                <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  opt.value === value ? "border-[var(--accent-primary)]" : "border-[var(--border-default)]"
                }`}>
                  {opt.value === value && (
                    <div className="h-2 w-2 rounded-full bg-[var(--accent-primary)]" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-[var(--text-primary)]">{opt.label}</p>
                  <p className="text-[12px] text-[var(--text-tertiary)]">{opt.description}</p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── ConfigurationTab ──────────────────────────────────────────────────────────

export interface ConfigurationTabProps {
  config: UseAiConfigReturn;
}

export default function ConfigurationTab({ config }: ConfigurationTabProps) {
  const {
    configLoading,
    autoReply,
    tone,
    threshold,
    savingConfig,
    configError,
    setToneState,
    setThresholdState,
    saveConfig,
  } = config;

  // ── Test AI reply state ───────────────────────────────────────────────────────
  const [testInput, setTestInput] = useState("");
  const [testReply, setTestReplyText] = useState<string | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);

  const handleTestSubmit = async () => {
    if (!testInput.trim()) return;
    setTestLoading(true);
    setTestReplyText(null);
    setTestError(null);
    try {
      const { reply } = await aiAssistantService.testReply(testInput.trim());
      setTestReplyText(reply);
    } catch {
      setTestError("AI-ul nu este disponibil momentan. Verifică că ANTHROPIC_API_KEY este configurat în backend.");
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="space-y-4">

      {configError && (
        <div className="rounded-xl border border-red-200/60 bg-red-50/50 px-4 py-3">
          <p className="text-[13px] text-red-600">{configError}</p>
        </div>
      )}

      {/* ── Auto-reply toggle ── */}
      <div className={CARD}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className={ICON_BOX}>
              <Bot className={ICON} />
            </div>
            <div>
              <p className={CARD_TITLE}>
                Auto-reply
              </p>
              <p className={CARD_DESC}>
                The AI assistant will automatically respond to incoming messages using the configured Knowledge Base.
              </p>
              <span
                className={`mt-2.5 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  autoReply
                    ? "bg-[#ECFDF5] text-[#047857] border border-[#D1FAE5]"
                    : "bg-[var(--border-subtle)] text-[var(--text-tertiary)] border border-transparent"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    autoReply ? "bg-emerald-500" : "bg-[var(--text-quaternary)]"
                  }`}
                />
                {autoReply ? "Activ" : "Inactiv"}
              </span>
            </div>
          </div>
          <Toggle
            checked={autoReply}
            onChange={(v) => saveConfig({ autoReplyEnabled: v })}
            disabled={savingConfig || configLoading}
          />
        </div>
      </div>

      {/* ── Response Tone ── */}
      <div className={CARD}>
        <div className="flex items-start gap-3.5 mb-5">
          <div className={ICON_BOX}>
            <SlidersHorizontal className={ICON} />
          </div>
          <div>
            <p className={CARD_TITLE}>Response Tone</p>
            <p className={CARD_DESC}>
              Define the AI assistant's communication style in conversations.
            </p>
          </div>
        </div>

        {configLoading ? (
          <div className="flex items-center gap-2 py-3 text-[13px] text-[var(--text-tertiary)]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </div>
        ) : (
          <ToneSelector
            value={tone}
            onChange={(v) => {
              setToneState(v);
              saveConfig({ responseTone: v });
            }}
            disabled={savingConfig}
          />
        )}
      </div>

      {/* ── Confidence Threshold ── */}
      <div className={CARD}>
        <div className="flex items-start gap-3.5 mb-5">
          <div className={ICON_BOX}>
            <ShieldCheck className={ICON} />
          </div>
          <div>
            <p className={CARD_TITLE}>Confidence Threshold</p>
            <p className={CARD_DESC}>
              The AI responds automatically <strong className="font-medium text-[var(--text-secondary)]">only</strong> if the confidence level exceeds the set threshold. Below the threshold, the message is flagged for manual review.
            </p>
          </div>
        </div>

        {configLoading ? (
          <div className="flex items-center gap-2 py-3 text-[13px] text-[var(--text-tertiary)]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </div>
        ) : (
          <ConfidenceSlider
            value={threshold}
            onChange={(v) => setThresholdState(v)}
            disabled={savingConfig}
          />
        )}

        <div className="mt-4 flex justify-end">
          <button
            onClick={() => saveConfig({ confidenceThreshold: threshold })}
            disabled={savingConfig || configLoading}
            className={PRIMARY_BTN}
          >
            {savingConfig ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            Save the threshold
          </button>
        </div>
      </div>

      {/* ── Test AI reply ── */}
      <div className={CARD}>
        <div className="flex items-start gap-3.5 mb-5">
          <div className={ICON_BOX}>
            <Send className={ICON} />
          </div>
          <div>
            <p className={CARD_TITLE}>Test AI Reply</p>
            <p className={CARD_DESC}>
              Send a test message and see the AI-generated response using the tone you configured above.
            </p>
          </div>
        </div>

        <textarea
          value={testInput}
          onChange={(e) => setTestInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleTestSubmit();
            }
          }}
          rows={3}
          placeholder="Write a test message..."
          className={TEXTAREA}
        />

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-[11px] text-[var(--text-tertiary)]">
            Press Enter to send · Press Shift+Enter for a new line
          </p>
          <button
            onClick={handleTestSubmit}
            disabled={testLoading || !testInput.trim()}
            className={PRIMARY_BTN}
          >
            {testLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            {testLoading ? "Se generează..." : "Test"}
          </button>
        </div>

        {testError && (
          <div className="mt-3 rounded-xl border border-red-200/60 bg-red-50/50 px-4 py-3">
            <p className="text-[13px] text-red-600">{testError}</p>
          </div>
        )}

        {testReply && (
          <div className="mt-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface-hover)] px-4 py-3">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-tertiary)]">
              AI Response
            </p>
            <p className="text-[13px] text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">{testReply}</p>
          </div>
        )}
      </div>

    </div>
  );
}
