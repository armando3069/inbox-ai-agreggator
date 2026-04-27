import { TelegramIcon, WhatsAppIcon, MessengerIcon, EmailIcon } from "../components/BrandIcons";

// ── Design tokens ──────────────────────────────────────────────────────────────

export const CARD =
  "rounded-2xl border border-[var(--border-warm)] bg-[var(--bg-surface)] shadow-[var(--shadow-card)]";

export const ICON_BOX =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--bg-surface-hover)]";

export const INPUT =
  "w-full rounded-[var(--radius-input)] border border-[var(--border-default)] bg-[var(--bg-page)]" +
  " px-4 py-2.5 text-[13px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)]" +
  " focus:outline-none focus:border-[var(--text-secondary)]" +
  " transition-all duration-150 ease-out leading-snug";

export const LABEL = "block text-[13px] font-medium text-[var(--text-secondary)]";

export const PRIMARY_BTN =
  "w-full inline-flex items-center justify-center gap-2 rounded-[var(--radius-button)]" +
  " bg-[var(--accent-primary)] py-2.5 text-[13px] font-medium text-white" +
  " hover:bg-[var(--accent-primary-hover)] active:scale-[0.98]" +
  " disabled:cursor-not-allowed disabled:opacity-40" +
  " transition-all duration-150 ease-out shadow-[var(--shadow-xs)]";

export const SECTION_LABEL =
  "text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]";

// ── Types ──────────────────────────────────────────────────────────────────────

export type PlatformStatus = "available" | "coming-soon";
export type StepState      = "active" | "completed" | "upcoming";
export type EmailProvider  = "gmail" | "outlook" | "custom";

export interface PlatformConfig {
  id:          string;
  label:       string;
  description: string;
  icon:        React.ReactNode;
  status:      PlatformStatus;
  iconClass:   string;
}

// ── Platform list ─────────────────────────────────────────────────────────────

export const PLATFORMS: PlatformConfig[] = [
  {
    id:          "telegram",
    label:       "Telegram",
    description: "Connect your support or sales bot.",
    icon:        <TelegramIcon />,
    status:      "available",
    iconClass:   "text-sky-500 dark:text-sky-400",
  },
  {
    id:          "whatsapp",
    label:       "WhatsApp",
    description: "Connect your WhatsApp Business account.",
    icon:        <WhatsAppIcon />,
    status:      "available",
    iconClass:   "text-emerald-600 dark:text-emerald-400",
  },
  {
    id:          "messenger",
    label:       "Messenger",
    description: "Connect your Facebook Messenger page.",
    icon:        <MessengerIcon />,
    status:      "available",
    iconClass:   "text-blue-500 dark:text-blue-400",
  },
  {
    id:          "email",
    label:       "Email (IMAP/SMTP)",
    description: "Connect Gmail or Outlook using an app password.",
    icon:        <EmailIcon />,
    status:      "available",
    iconClass:   "text-orange-500 dark:text-orange-400",
  },
];

// ── Email providers ───────────────────────────────────────────────────────────

export const EMAIL_PROVIDERS = [
  { value: "gmail",   label: "Gmail" },
  { value: "outlook", label: "Outlook / Microsoft 365" },
  { value: "custom",  label: "Custom (IMAP/SMTP)" },
] as const;

// ── Webhook env vars ──────────────────────────────────────────────────────────

export const WHATSAPP_VERIFY_TOKEN =
  process.env.NEXT_PUBLIC_WHATSAPP_VERIFY_TOKEN ?? "zottis_verify_token";

export const WHATSAPP_WEBHOOK_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_WEBHOOK_URL ??
  `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/webhooks/whatsapp`;

export const MESSENGER_VERIFY_TOKEN =
  process.env.NEXT_PUBLIC_MESSENGER_VERIFY_TOKEN ?? "zottis_messenger_verify_token";

export const MESSENGER_WEBHOOK_URL =
  process.env.NEXT_PUBLIC_MESSENGER_WEBHOOK_URL ??
  `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/webhooks/messenger`;
