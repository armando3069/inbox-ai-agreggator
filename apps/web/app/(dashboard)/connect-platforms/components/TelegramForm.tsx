import { type FormEvent } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { CARD, ICON_BOX, INPUT, LABEL, PRIMARY_BTN } from "../utils/platforms.constants";
import { TelegramIcon } from "./BrandIcons";

interface TelegramFormProps {
  botToken:         string;
  onBotTokenChange: (v: string) => void;
  isConnecting:     boolean;
  error:            string | null;
  onSubmit:         (e: FormEvent) => void;
}

export function TelegramForm({ botToken, onBotTokenChange, isConnecting, error, onSubmit }: TelegramFormProps) {
  return (
    <div className={`${CARD} p-6`}>
      {/* Header */}
      <div className="flex items-start gap-3 pb-5 border-b border-[var(--border-subtle)]">
        <div className={ICON_BOX}>
          <span className="text-sky-500 dark:text-sky-400"><TelegramIcon /></span>
        </div>
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)] leading-tight">
            Connect to Telegram
          </h2>
          <p className="mt-0.5 text-[13px] text-[var(--text-secondary)] leading-relaxed">
            Enter your Telegram bot's token
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="mt-5 space-y-5">
        <div className="space-y-2">
          <label htmlFor="tg-bot-token" className={LABEL}>Bot Token</label>
          <input
            id="tg-bot-token"
            type="password"
            value={botToken}
            onChange={(e) => onBotTokenChange(e.target.value)}
            placeholder="1234567890:ABCDefgh..."
            required
            autoFocus
            className={INPUT}
          />
          <p className="text-[12px] text-[var(--text-tertiary)] leading-relaxed">
            Get the token from{" "}
            <span className="font-semibold text-[var(--text-secondary)]">@BotFather</span> by command{" "}
            <code className="rounded border border-[var(--border-default)] bg-[var(--bg-surface-hover)] px-1.5 py-0.5 text-[11px] font-mono text-[var(--text-primary)]">
              /newbot
            </code>
            .
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="pt-1">
          <button type="submit" disabled={isConnecting || !botToken.trim()} className={PRIMARY_BTN}>
            {isConnecting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isConnecting ? "Connecting..." : "Connect to Telegram"}
          </button>
        </div>
      </form>
    </div>
  );
}
