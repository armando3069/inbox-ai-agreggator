import { type FormEvent } from "react";
import { AlertCircle, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { CARD, ICON_BOX, INPUT, LABEL, PRIMARY_BTN, EMAIL_PROVIDERS } from "../utils/platforms.constants";
import type { EmailProvider } from "../utils/platforms.constants";
import { EmailIcon } from "./BrandIcons";

interface EmailFormProps {
  email:               string;
  password:            string;
  provider:            EmailProvider;
  showAdvanced:        boolean;
  imapHost:            string;
  imapPort:            string;
  imapSecure:          boolean;
  smtpHost:            string;
  smtpPort:            string;
  smtpSecure:          boolean;
  onEmailChange:       (v: string) => void;
  onPasswordChange:    (v: string) => void;
  onProviderChange:    (v: EmailProvider) => void;
  onShowAdvancedChange:(v: boolean) => void;
  onImapHostChange:    (v: string) => void;
  onImapPortChange:    (v: string) => void;
  onImapSecureChange:  (v: boolean) => void;
  onSmtpHostChange:    (v: string) => void;
  onSmtpPortChange:    (v: string) => void;
  onSmtpSecureChange:  (v: boolean) => void;
  isConnecting:        boolean;
  error:               string | null;
  onSubmit:            (e: FormEvent) => void;
}

export function EmailForm({
  email, password, provider, showAdvanced,
  imapHost, imapPort, imapSecure,
  smtpHost, smtpPort, smtpSecure,
  onEmailChange, onPasswordChange, onProviderChange, onShowAdvancedChange,
  onImapHostChange, onImapPortChange, onImapSecureChange,
  onSmtpHostChange, onSmtpPortChange, onSmtpSecureChange,
  isConnecting, error, onSubmit,
}: EmailFormProps) {
  const isCustom            = provider === "custom";
  const showAdvancedSection = showAdvanced || isCustom;

  return (
    <div className={`${CARD} p-6`}>
      {/* Header */}
      <div className="flex items-start gap-3 pb-5 border-b border-[var(--border-subtle)]">
        <div className={ICON_BOX}>
          <span className="text-orange-500 dark:text-orange-400"><EmailIcon /></span>
        </div>
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)] leading-tight">
            Connect Email
          </h2>
          <p className="mt-0.5 text-[13px] text-[var(--text-secondary)] leading-relaxed">
            IMAP + SMTP with app password
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="mt-5 space-y-5">

        {/* Provider */}
        <div className="space-y-2">
          <label htmlFor="em-provider" className={LABEL}>Provider</label>
          <select
            id="em-provider"
            value={provider}
            onChange={(e) => onProviderChange(e.target.value as EmailProvider)}
            className={INPUT}
          >
            {EMAIL_PROVIDERS.map((p) => (
              <option key={p.value} value={p.value} className="bg-[var(--bg-surface)]">
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="em-email" className={LABEL}>Email address</label>
          <input
            id="em-email"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="you@gmail.com"
            required
            autoFocus
            className={INPUT}
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label htmlFor="em-password" className={LABEL}>
            {provider === "gmail"
              ? "Parolă de aplicație"
              : provider === "outlook"
              ? "Parolă cont / aplicație"
              : "Parolă"}
          </label>
          <input
            id="em-password"
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="••••••••••••••••"
            required
            className={INPUT}
          />
          {provider === "gmail" && (
            <p className="text-[12px] text-[var(--text-tertiary)] leading-relaxed">
              Generate an app password in{" "}
              <span className="font-semibold text-[var(--text-secondary)]">
                Google Account → Security → App passwords
              </span>
              .
            </p>
          )}
          {provider === "outlook" && (
            <p className="text-[12px] text-[var(--text-tertiary)] leading-relaxed">
              Enable IMAP in Outlook settings and use your account password.
            </p>
          )}
        </div>

        {/* Advanced toggle */}
        {!isCustom && (
          <button
            type="button"
            onClick={() => onShowAdvancedChange(!showAdvanced)}
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors duration-150"
          >
            {showAdvanced
              ? <ChevronUp className="h-3.5 w-3.5" />
              : <ChevronDown className="h-3.5 w-3.5" />}
            Advanced settings IMAP/SMTP
          </button>
        )}

        {/* Advanced IMAP/SMTP section */}
        {showAdvancedSection && (
          <div className="space-y-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-page)] px-4 py-4">
            <p className="text-[12px] font-semibold text-[var(--text-secondary)]">IMAP</p>
            <div className="grid grid-cols-[1fr_80px_auto] gap-2 items-end">
              <div className="space-y-1.5">
                <label className={LABEL}>Host</label>
                <input
                  type="text"
                  value={imapHost}
                  onChange={(e) => onImapHostChange(e.target.value)}
                  placeholder="imap.example.com"
                  className={INPUT}
                />
              </div>
              <div className="space-y-1.5">
                <label className={LABEL}>Port</label>
                <input
                  type="number"
                  value={imapPort}
                  onChange={(e) => onImapPortChange(e.target.value)}
                  placeholder="993"
                  className={INPUT}
                />
              </div>
              <div className="space-y-1.5">
                <label className={LABEL}>SSL</label>
                <div className="flex items-center h-[42px]">
                  <input
                    type="checkbox"
                    id="imap-secure"
                    checked={imapSecure}
                    onChange={(e) => onImapSecureChange(e.target.checked)}
                    className="h-4 w-4 rounded border-[var(--border-default)] cursor-pointer accent-[var(--accent-primary)]"
                  />
                </div>
              </div>
            </div>

            <p className="text-[12px] font-semibold text-[var(--text-secondary)] pt-1">SMTP</p>
            <div className="grid grid-cols-[1fr_80px_auto] gap-2 items-end">
              <div className="space-y-1.5">
                <label className={LABEL}>Host</label>
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(e) => onSmtpHostChange(e.target.value)}
                  placeholder="smtp.example.com"
                  className={INPUT}
                />
              </div>
              <div className="space-y-1.5">
                <label className={LABEL}>Port</label>
                <input
                  type="number"
                  value={smtpPort}
                  onChange={(e) => onSmtpPortChange(e.target.value)}
                  placeholder="587"
                  className={INPUT}
                />
              </div>
              <div className="space-y-1.5">
                <label className={LABEL}>SSL</label>
                <div className="flex items-center h-[42px]">
                  <input
                    type="checkbox"
                    id="smtp-secure"
                    checked={smtpSecure}
                    onChange={(e) => onSmtpSecureChange(e.target.checked)}
                    className="h-4 w-4 rounded border-[var(--border-default)] cursor-pointer accent-[var(--accent-primary)]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="pt-1">
          <button
            type="submit"
            disabled={isConnecting || !email.trim() || !password.trim()}
            className={PRIMARY_BTN}
          >
            {isConnecting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isConnecting ? "Se conectează…" : "Conectează Email"}
          </button>
        </div>
      </form>
    </div>
  );
}
