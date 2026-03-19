"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

import { PLATFORMS, SECTION_LABEL } from "./utils/platforms.constants";
import { useConnectPlatforms } from "./hooks/useConnectPlatforms";

import { StepItem }        from "./components/StepIndicator";
import { PlatformCard }    from "./components/PlatformCard";
import { EmptyConfigPanel } from "./components/EmptyConfigPanel";
import { TelegramForm }    from "./components/TelegramForm";
import { WhatsAppForm }    from "./components/WhatsAppForm";
import { MessengerForm }   from "./components/MessengerForm";
import { EmailForm }       from "./components/EmailForm";

// ── Inner page (needs useSearchParams → wrapped in Suspense below) ────────────

function ConnectPlatformsContent() {
  const searchParams = useSearchParams();
  const isManaging   = searchParams.get("manage") === "1";

  const {
    isAuthLoading, isCheckingPlatforms,
    connectedIds, selectedId, handleCardClick,
    isConnecting, connectError, toast,
    tgBotToken, setTgBotToken, handleTelegramSubmit,
    waAccessToken, setWaAccessToken, waPhoneNumberId, setWaPhoneNumberId, handleWhatsappSubmit,
    msPageId, setMsPageId, msPageAccessToken, setMsPageAccessToken, handleMessengerSubmit,
    emEmail, setEmEmail, emPassword, setEmPassword,
    emProvider, setEmProvider, emShowAdvanced, setEmShowAdvanced,
    emImapHost, setEmImapHost, emImapPort, setEmImapPort, emImapSecure, setEmImapSecure,
    emSmtpHost, setEmSmtpHost, emSmtpPort, setEmSmtpPort, emSmtpSecure, setEmSmtpSecure,
    handleEmailSubmit,
  } = useConnectPlatforms(isManaging);

  const currentStep = selectedId ? 2 : 1;

  if (isAuthLoading || isCheckingPlatforms) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-[var(--text-tertiary)]" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden rounded-xl bg-[var(--bg-surface)] shadow-[var(--shadow-card)] border border-[var(--border-default)]">

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-medium text-emerald-700 shadow-[var(--shadow-dropdown)] dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {toast}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[980px] mx-auto px-8 py-8">

          {/* ── Page header ── */}
          <div className="mb-7">
            <h1 className="text-[20px] font-semibold text-[var(--text-primary)] tracking-tight leading-none">
              {isManaging ? "Gestionează platformele" : "Conectează-ți prima platformă"}
            </h1>
            <p className="mt-1.5 text-[13px] text-[var(--text-secondary)] leading-relaxed">
              {isManaging
                ? "Adaugă sau gestionează canalele de comunicare conectate."
                : "Alege canalul de comunicare pe care vrei să-l gestionezi."}
            </p>
          </div>

          {/* ── Step flow ── */}
          <div className="mb-8 flex items-center gap-3">
            <StepItem number={1} label="Alege platforma" state={currentStep > 1 ? "completed" : "active"} />
            <div className="w-8 h-px bg-[var(--border-default)]" />
            <StepItem number={2} label="Conectează"      state={currentStep === 2 ? "active" : "upcoming"} />
            <div className="w-8 h-px bg-[var(--border-default)]" />
            <StepItem number={3} label="Configurează"    state="upcoming" />
          </div>

          {/* ── Two-column layout ── */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-start">

            {/* LEFT: Platform grid */}
            <div className="flex-1 min-w-0 space-y-3">
              <p className={SECTION_LABEL}>Platforme disponibile</p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {PLATFORMS.filter((p) => p.status === "available").map((platform) => (
                  <PlatformCard
                    key={platform.id}
                    platform={platform}
                    isSelected={selectedId === platform.id}
                    isConnected={connectedIds.has(platform.id)}
                    onClick={() => handleCardClick(platform)}
                  />
                ))}
              </div>
            </div>

            {/* RIGHT: Configuration panel */}
            <div className="w-full lg:w-[420px] lg:shrink-0 space-y-3">
              <p className={SECTION_LABEL}>Configurare integrare</p>

              {selectedId === "telegram" && (
                <TelegramForm
                  botToken={tgBotToken}
                  onBotTokenChange={setTgBotToken}
                  isConnecting={isConnecting}
                  error={connectError}
                  onSubmit={handleTelegramSubmit}
                />
              )}

              {selectedId === "whatsapp" && (
                <WhatsAppForm
                  accessToken={waAccessToken}
                  phoneNumberId={waPhoneNumberId}
                  onAccessTokenChange={setWaAccessToken}
                  onPhoneNumberIdChange={setWaPhoneNumberId}
                  isConnecting={isConnecting}
                  error={connectError}
                  onSubmit={handleWhatsappSubmit}
                />
              )}

              {selectedId === "messenger" && (
                <MessengerForm
                  pageId={msPageId}
                  pageAccessToken={msPageAccessToken}
                  onPageIdChange={setMsPageId}
                  onPageAccessTokenChange={setMsPageAccessToken}
                  isConnecting={isConnecting}
                  error={connectError}
                  onSubmit={handleMessengerSubmit}
                />
              )}

              {selectedId === "email" && (
                <EmailForm
                  email={emEmail}             password={emPassword}
                  provider={emProvider}       showAdvanced={emShowAdvanced}
                  imapHost={emImapHost}       imapPort={emImapPort}       imapSecure={emImapSecure}
                  smtpHost={emSmtpHost}       smtpPort={emSmtpPort}       smtpSecure={emSmtpSecure}
                  onEmailChange={setEmEmail}              onPasswordChange={setEmPassword}
                  onProviderChange={setEmProvider}        onShowAdvancedChange={setEmShowAdvanced}
                  onImapHostChange={setEmImapHost}        onImapPortChange={setEmImapPort}        onImapSecureChange={setEmImapSecure}
                  onSmtpHostChange={setEmSmtpHost}        onSmtpPortChange={setEmSmtpPort}        onSmtpSecureChange={setEmSmtpSecure}
                  isConnecting={isConnecting}
                  error={connectError}
                  onSubmit={handleEmailSubmit}
                />
              )}

              {!selectedId && <EmptyConfigPanel />}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page wrapper ──────────────────────────────────────────────────────────────

export default function ConnectPlatformsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--text-tertiary)]" />
        </div>
      }
    >
      <ConnectPlatformsContent />
    </Suspense>
  );
}
