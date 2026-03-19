"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getToken } from "@/services/auth/auth-service";
import { platformsService } from "@/services/platforms/platforms.service";
import type { PlatformAccount } from "@/services/platforms/platforms.types";
import type { EmailProvider, PlatformConfig } from "../utils/platforms.constants";

export function useConnectPlatforms(isManaging: boolean) {
  const router = useRouter();
  const { isLoading: isAuthLoading } = useAuth();

  // ── Platform state ─────────────────────────────────────────────────────────
  const [isCheckingPlatforms, setIsCheckingPlatforms] = useState(true);
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId]     = useState<string | null>(null);

  // ── Connection state ───────────────────────────────────────────────────────
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [toast, setToast]               = useState<string | null>(null);

  // ── Telegram fields ────────────────────────────────────────────────────────
  const [tgBotToken, setTgBotToken] = useState("");

  // ── WhatsApp fields ────────────────────────────────────────────────────────
  const [waAccessToken, setWaAccessToken]     = useState("");
  const [waPhoneNumberId, setWaPhoneNumberId] = useState("");

  // ── Messenger fields ───────────────────────────────────────────────────────
  const [msPageId, setMsPageId]                   = useState("");
  const [msPageAccessToken, setMsPageAccessToken] = useState("");

  // ── Email fields ───────────────────────────────────────────────────────────
  const [emEmail, setEmEmail]               = useState("");
  const [emPassword, setEmPassword]         = useState("");
  const [emProvider, setEmProvider]         = useState<EmailProvider>("gmail");
  const [emShowAdvanced, setEmShowAdvanced] = useState(false);
  const [emImapHost, setEmImapHost]         = useState("");
  const [emImapPort, setEmImapPort]         = useState("993");
  const [emImapSecure, setEmImapSecure]     = useState(true);
  const [emSmtpHost, setEmSmtpHost]         = useState("");
  const [emSmtpPort, setEmSmtpPort]         = useState("587");
  const [emSmtpSecure, setEmSmtpSecure]     = useState(false);

  const platformsChecked = useRef(false);

  // ── Auth guard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isAuthLoading) return;
    if (!getToken()) router.replace("/auth/login");
  }, [isAuthLoading, router]);

  // ── Fetch connected accounts ───────────────────────────────────────────────
  useEffect(() => {
    if (isAuthLoading || platformsChecked.current) return;
    const token = getToken();
    if (!token) return;

    platformsChecked.current = true;

    platformsService
      .getAccounts()
      .then(({ total, accounts }) => {
        const ids = new Set(accounts.map((a: PlatformAccount) => a.platform));
        setConnectedIds(ids);

        if (!isManaging && total > 0) {
          router.replace("/inbox");
        } else {
          setIsCheckingPlatforms(false);
        }
      })
      .catch(() => setIsCheckingPlatforms(false));
  }, [isAuthLoading, isManaging, router]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const resetFormFields = () => {
    setTgBotToken("");
    setWaAccessToken("");
    setWaPhoneNumberId("");
    setMsPageId("");
    setMsPageAccessToken("");
    setEmEmail("");
    setEmPassword("");
    setEmProvider("gmail");
    setEmShowAdvanced(false);
    setEmImapHost("");
    setEmImapPort("993");
    setEmImapSecure(true);
    setEmSmtpHost("");
    setEmSmtpPort("587");
    setEmSmtpSecure(false);
  };

  const onSuccess = (platform: string, message: string) => {
    setToast(message);
    setConnectedIds((prev) => new Set(prev).add(platform));
    setSelectedId(null);
    if (!isManaging) {
      setTimeout(() => router.replace("/inbox"), 1500);
    } else {
      setTimeout(() => setToast(null), 2000);
    }
  };

  // ── Card click ─────────────────────────────────────────────────────────────
  const handleCardClick = (platform: PlatformConfig) => {
    if (platform.status !== "available") return;
    if (connectedIds.has(platform.id)) return;
    setSelectedId(platform.id);
    setConnectError(null);
    resetFormFields();
  };

  // ── Submit handlers ────────────────────────────────────────────────────────

  const handleTelegramSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setConnectError(null);
    setIsConnecting(true);
    try {
      await platformsService.connectTelegram(tgBotToken.trim());
      onSuccess("telegram", "Telegram conectat cu succes.");
    } catch (err) {
      setConnectError(err instanceof Error ? err.message : "A apărut o eroare.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleWhatsappSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setConnectError(null);
    setIsConnecting(true);
    try {
      await platformsService.connectWhatsapp(waAccessToken.trim(), waPhoneNumberId.trim());
      onSuccess("whatsapp", "WhatsApp conectat cu succes.");
    } catch (err) {
      setConnectError(err instanceof Error ? err.message : "A apărut o eroare.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleMessengerSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setConnectError(null);
    setIsConnecting(true);
    try {
      await platformsService.connectMessenger(msPageId.trim(), msPageAccessToken.trim());
      onSuccess("messenger", "Messenger conectat cu succes.");
    } catch (err) {
      setConnectError(err instanceof Error ? err.message : "A apărut o eroare.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setConnectError(null);
    setIsConnecting(true);
    try {
      const payload: Parameters<typeof platformsService.connectEmail>[0] = {
        email:    emEmail.trim(),
        password: emPassword,
        provider: emProvider,
      };

      if (emProvider === "custom" || emShowAdvanced) {
        if (emImapHost.trim()) {
          payload.imapOverride = {
            host:   emImapHost.trim(),
            port:   parseInt(emImapPort, 10) || 993,
            secure: emImapSecure,
          };
        }
        if (emSmtpHost.trim()) {
          payload.smtpOverride = {
            host:   emSmtpHost.trim(),
            port:   parseInt(emSmtpPort, 10) || 587,
            secure: emSmtpSecure,
          };
        }
      }

      await platformsService.connectEmail(payload);
      onSuccess("email", "Email conectat cu succes.");
    } catch (err) {
      setConnectError(err instanceof Error ? err.message : "A apărut o eroare.");
    } finally {
      setIsConnecting(false);
    }
  };

  return {
    // loading
    isAuthLoading,
    isCheckingPlatforms,
    // selection
    connectedIds,
    selectedId,
    handleCardClick,
    // connection status
    isConnecting,
    connectError,
    toast,
    // telegram
    tgBotToken, setTgBotToken,
    handleTelegramSubmit,
    // whatsapp
    waAccessToken, setWaAccessToken,
    waPhoneNumberId, setWaPhoneNumberId,
    handleWhatsappSubmit,
    // messenger
    msPageId, setMsPageId,
    msPageAccessToken, setMsPageAccessToken,
    handleMessengerSubmit,
    // email
    emEmail, setEmEmail,
    emPassword, setEmPassword,
    emProvider, setEmProvider,
    emShowAdvanced, setEmShowAdvanced,
    emImapHost, setEmImapHost,
    emImapPort, setEmImapPort,
    emImapSecure, setEmImapSecure,
    emSmtpHost, setEmSmtpHost,
    emSmtpPort, setEmSmtpPort,
    emSmtpSecure, setEmSmtpSecure,
    handleEmailSubmit,
  };
}
