import { AlertCircle, CheckCircle2, ExternalLink, Loader2, Unplug } from "lucide-react";
import {
  CARD, ICON_BOX, PRIMARY_BTN,
  MESSENGER_WEBHOOK_URL, MESSENGER_VERIFY_TOKEN,
} from "../utils/platforms.constants";
import { MessengerIcon } from "./BrandIcons";
import { CopyField } from "./CopyField";
import type {
  FacebookConnectionStatus,
  FacebookPendingPage,
} from "@/services/platforms/platforms.types";

interface MessengerFormProps {
  isConnecting: boolean;
  isDisconnecting: boolean;
  isLoadingState: boolean;
  error: string | null;
  connectedPage: FacebookConnectionStatus | null;
  pendingPages: FacebookPendingPage[];
  onConnect: () => void;
  onDisconnect: () => void;
  onSelectPage: (pageId: string) => void;
}

export function MessengerForm({
  isConnecting,
  isDisconnecting,
  isLoadingState,
  error,
  connectedPage,
  pendingPages,
  onConnect,
  onDisconnect,
  onSelectPage,
}: MessengerFormProps) {
  const hasPendingPages = pendingPages.length > 0;
  const isConnected = connectedPage?.connected;

  return (
    <div className="space-y-4">
      <div className={`${CARD} p-6`}>
        <div className="flex items-start gap-3 pb-5 border-b border-[var(--border-subtle)]">
          <div className={ICON_BOX}>
            <span className="text-blue-500 dark:text-blue-400"><MessengerIcon /></span>
          </div>
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold text-[var(--text-primary)] leading-tight">
              Connect Messenger
            </h2>
            <p className="mt-0.5 text-[13px] text-[var(--text-secondary)] leading-relaxed">
              Facebook Messenger — Graph API
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-page)] px-4 py-4">
            <p className="text-[13px] font-medium text-[var(--text-primary)]">
              Official Meta OAuth Connection
            </p>
            <p className="mt-1 text-[12px] text-[var(--text-secondary)] leading-relaxed">
              The user is redirected to Facebook, grants the necessary permissions, and then selects the page they want to sync to their inbox.
            </p>
          </div>

          {isLoadingState && (
            <div className="flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-page)] px-4 py-3 text-[13px] text-[var(--text-secondary)]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading Facebook integration status…
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {!isLoadingState && !hasPendingPages && !isConnected && (
            <button
              type="button"
              disabled={isConnecting}
              className={PRIMARY_BTN}
              onClick={onConnect}
            >
              {isConnecting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {!isConnecting && <ExternalLink className="h-3.5 w-3.5" />}
              {isConnecting ? "Se pregătește redirecționarea…" : "Connect Facebook"}
            </button>
          )}

          {hasPendingPages && (
            <div className="space-y-3">
              <div>
                <p className="text-[13px] font-semibold text-[var(--text-primary)]">
                  Select the Facebook page
                </p>
                <p className="mt-1 text-[12px] text-[var(--text-secondary)] leading-relaxed">
                  We found several pages managed by this account. Choose the page you want to connect to your Messenger inbox.
                </p>
              </div>

              <div className="space-y-3">
                {pendingPages.map((page) => (
                  <div
                    key={page.pageId}
                    className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-page)] px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-[var(--text-primary)]">
                          {page.pageName}
                        </p>
                        <p className="mt-1 text-[12px] text-[var(--text-secondary)]">
                          Page ID: {page.pageId}
                        </p>
                        {page.category && (
                          <p className="mt-1 text-[12px] text-[var(--text-tertiary)]">
                            {page.category}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        className="inline-flex shrink-0 items-center gap-2 rounded-[var(--radius-button)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 text-[12px] font-medium text-[var(--text-primary)] transition hover:bg-[var(--bg-surface-hover)] disabled:opacity-50"
                        disabled={isConnecting}
                        onClick={() => onSelectPage(page.pageId)}
                      >
                        {isConnecting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        Connect this page
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isConnected && (
            <div className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-emerald-800 dark:text-emerald-300">
                    Facebook Messenger connected
                  </p>
                  <p className="mt-1 text-[12px] text-emerald-700/90 dark:text-emerald-400/90">
                    {connectedPage.pageName ?? "Unknown page"}
                  </p>
                  <p className="mt-1 text-[12px] text-emerald-700/80 dark:text-emerald-400/80">
                    Page ID: {connectedPage.pageId ?? "Unknown"}
                  </p>
                  <div className="mt-2 inline-flex items-center rounded-full border border-emerald-300 bg-white/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                    {connectedPage.status ?? "active"}
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={isDisconnecting}
                onClick={onDisconnect}
                className="inline-flex items-center gap-2 rounded-[var(--radius-button)] border border-red-200 bg-white px-3.5 py-2 text-[12px] font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/40"
              >
                {isDisconnecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Unplug className="h-3.5 w-3.5" />}
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>


    </div>
  );
}
