import { type FormEvent } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  CARD, ICON_BOX, INPUT, LABEL, PRIMARY_BTN,
  WHATSAPP_WEBHOOK_URL, WHATSAPP_VERIFY_TOKEN,
} from "../utils/platforms.constants";
import { WhatsAppIcon } from "./BrandIcons";
import { CopyField } from "./CopyField";

interface WhatsAppFormProps {
  accessToken:          string;
  phoneNumberId:        string;
  onAccessTokenChange:  (v: string) => void;
  onPhoneNumberIdChange:(v: string) => void;
  isConnecting:         boolean;
  error:                string | null;
  onSubmit:             (e: FormEvent) => void;
}

export function WhatsAppForm({
  accessToken,
  phoneNumberId,
  onAccessTokenChange,
  onPhoneNumberIdChange,
  isConnecting,
  error,
  onSubmit,
}: WhatsAppFormProps) {
  return (
    <div className="space-y-4">
      {/* ── Credentials card ── */}
      <div className={`${CARD} p-6`}>
        <div className="flex items-start gap-3 pb-5 border-b border-[var(--border-subtle)]">
          <div className={ICON_BOX}>
            <span className="text-emerald-600 dark:text-emerald-400"><WhatsAppIcon /></span>
          </div>
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold text-[var(--text-primary)] leading-tight">
              Connect WhatsApp
            </h2>
            <p className="mt-0.5 text-[13px] text-[var(--text-secondary)] leading-relaxed">
              WhatsApp Business Cloud API
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <div className="space-y-2">
            <label htmlFor="wa-token" className={LABEL}>Access Token</label>
            <input
              id="wa-token"
              type="password"
              value={accessToken}
              onChange={(e) => onAccessTokenChange(e.target.value)}
              placeholder="EAAUlx…"
              required
              autoFocus
              className={INPUT}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="wa-phone-id" className={LABEL}>Phone Number ID</label>
            <input
              id="wa-phone-id"
              type="text"
              value={phoneNumberId}
              onChange={(e) => onPhoneNumberIdChange(e.target.value)}
              placeholder="102391771747…"
              required
              className={INPUT}
            />
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="pt-1">
            <button
              type="submit"
              disabled={isConnecting || !accessToken.trim() || !phoneNumberId.trim()}
              className={PRIMARY_BTN}
            >
              {isConnecting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isConnecting ? "Connecting..." : "Connect to WhatsApp"}
            </button>
          </div>
        </form>
      </div>

      {/* ── Webhook configuration card ── */}
      <div className={`${CARD} p-6`}>
        <div className="mb-5">
          <p className="text-[13px] font-semibold text-[var(--text-primary)]">Webhook Setup</p>
          <p className="mt-0.5 text-[12px] text-[var(--text-secondary)] leading-relaxed">
            Set up the webhook in the Meta Developer Portal.
          </p>
        </div>

        <div className="space-y-4">
          <CopyField label="Callback URL" value={WHATSAPP_WEBHOOK_URL} />
          <CopyField label="Verify Token" value={WHATSAPP_VERIFY_TOKEN} />
        </div>

        <div className="mt-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-page)] px-4 py-4">
          <p className="text-[12px] font-semibold text-[var(--text-secondary)] mb-2.5">Steps to follow</p>
          <ol className="space-y-2 text-[12px] text-[var(--text-tertiary)] leading-relaxed">
            <li className="flex gap-2">
              <span className="shrink-0 font-semibold text-[var(--accent-primary)]">1.</span>
              <span>
                Meta Developer Portal → WhatsApp → Configuration → Webhook →{" "}
                <span className="font-semibold text-[var(--text-secondary)]">Edit</span>
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0 font-semibold text-[var(--accent-primary)]">2.</span>
              <span>
                Paste the URL and token above, then click{" "}
                <span className="font-semibold text-[var(--text-secondary)]">Verify and Save</span>
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0 font-semibold text-[var(--accent-primary)]">3.</span>
              <span>
                Subscribe to the event{" "}
                <code className="rounded border border-[var(--border-default)] bg-[var(--bg-surface-hover)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--text-primary)]">
                  messages
                </code>
              </span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
