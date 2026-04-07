"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getToken } from "@/services/auth/auth-service";
import { platformsService } from "@/services/platforms/platforms.service";
import type {
  FacebookConnectionStatus,
  FacebookPendingPage,
  PlatformAccount,
} from "@/services/platforms/platforms.types";
import type { EmailProvider, PlatformConfig } from "../utils/platforms.constants";

export function useConnectPlatforms(isManaging: boolean) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading: isAuthLoading } = useAuth();

  // ── Platform state ─────────────────────────────────────────────────────────
  const [isCheckingPlatforms, setIsCheckingPlatforms] = useState(true);
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId]     = useState<string | null>(null);

  // ── Connection state ───────────────────────────────────────────────────────
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [toast, setToast]               = useState<string | null>(null);

  // ── Telegram fields ────────────────────────────────────────────────────────
  const [tgBotToken, setTgBotToken] = useState("");

  // ── WhatsApp fields ────────────────────────────────────────────────────────
  const [waAccessToken, setWaAccessToken]     = useState("");
  const [waPhoneNumberId, setWaPhoneNumberId] = useState("");

  // ── Facebook Messenger state ──────────────────────────────────────────────
  const [isFacebookStatusLoading, setIsFacebookStatusLoading] = useState(true);
  const [facebookConnection, setFacebookConnection] = useState<FacebookConnectionStatus | null>(null);
  const [facebookPendingPages, setFacebookPendingPages] = useState<FacebookPendingPage[]>([]);
  const [facebookSessionId, setFacebookSessionId] = useState<string | null>(null);

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

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  // ── Card click ─────────────────────────────────────────────────────────────
  const handleCardClick = (platform: PlatformConfig) => {
    if (platform.status !== "available") return;
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

  const refreshFacebookStatus = async () => {
    setIsFacebookStatusLoading(true);
    try {
      const status = await platformsService.getFacebookStatus();
      setFacebookConnection(status.connected ? status : null);
      setConnectedIds((prev) => {
        const next = new Set(prev);
        if (status.connected) next.add("messenger");
        else next.delete("messenger");
        return next;
      });
    } catch {
      setFacebookConnection(null);
    } finally {
      setIsFacebookStatusLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthLoading) return;
    if (!getToken()) return;
    void refreshFacebookStatus();
  }, [isAuthLoading]);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!getToken()) return;

    const facebookMode = searchParams.get("facebook");
    const sessionId = searchParams.get("sessionId");
    const reason = searchParams.get("reason");
    const pageName = searchParams.get("pageName");

    if (!facebookMode) return;

    setSelectedId("messenger");

    const clearFacebookParams = () => {
      router.replace(isManaging ? "/connect-platforms?manage=1" : "/connect-platforms");
    };

    if (facebookMode === "connected") {
      setFacebookPendingPages([]);
      setFacebookSessionId(null);
      setConnectError(null);
      showToast(
        pageName
          ? `${pageName} a fost conectată cu succes.`
          : "Messenger conectat cu succes.",
      );
      void refreshFacebookStatus().finally(clearFacebookParams);
      return;
    }

    if (facebookMode === "select_page" && sessionId) {
      setConnectError(null);
      setIsFacebookStatusLoading(true);
      platformsService
        .getFacebookPendingPages(sessionId)
        .then(({ pages }) => {
          setFacebookPendingPages(pages);
          setFacebookSessionId(sessionId);
        })
        .catch((err) => {
          setFacebookPendingPages([]);
          setFacebookSessionId(null);
          setConnectError(err instanceof Error ? err.message : "Nu am putut încărca paginile Facebook.");
        })
        .finally(() => {
          setIsFacebookStatusLoading(false);
          clearFacebookParams();
        });
      return;
    }

    if (facebookMode === "error") {
      setFacebookPendingPages([]);
      setFacebookSessionId(null);
      setConnectError(mapFacebookError(reason));
      clearFacebookParams();
    }
  }, [isAuthLoading, isManaging, router, searchParams]);

  const handleFacebookConnect = async () => {
    setConnectError(null);
    setIsConnecting(true);
    try {
      const { url } = await platformsService.getFacebookConnectUrl();
      window.location.href = url;
    } catch (err) {
      setConnectError(err instanceof Error ? err.message : "Nu am putut porni conectarea Facebook.");
      setIsConnecting(false);
    }
  };

  const handleFacebookPageSelect = async (pageId: string) => {
    if (!facebookSessionId) {
      setConnectError("Sesiunea de selecție Facebook a expirat. Reîncearcă.");
      return;
    }

    setConnectError(null);
    setIsConnecting(true);
    try {
      await platformsService.selectFacebookPage(facebookSessionId, pageId);
      setFacebookPendingPages([]);
      setFacebookSessionId(null);
      await refreshFacebookStatus();
      setConnectedIds((prev) => new Set(prev).add("messenger"));
      setSelectedId("messenger");
      showToast("Messenger conectat cu succes.");
    } catch (err) {
      setConnectError(err instanceof Error ? err.message : "Nu am putut conecta pagina selectată.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleFacebookDisconnect = async () => {
    setConnectError(null);
    setIsDisconnecting(true);
    try {
      await platformsService.disconnectFacebook();
      await refreshFacebookStatus();
      setFacebookPendingPages([]);
      setFacebookSessionId(null);
      setConnectedIds((prev) => {
        const next = new Set(prev);
        next.delete("messenger");
        return next;
      });
      setSelectedId("messenger");
      showToast("Facebook Messenger a fost deconectat.");
    } catch (err) {
      setConnectError(err instanceof Error ? err.message : "Nu am putut deconecta pagina Facebook.");
    } finally {
      setIsDisconnecting(false);
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
    isDisconnecting,
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
    isFacebookStatusLoading,
    facebookConnection,
    facebookPendingPages,
    handleFacebookConnect,
    handleFacebookPageSelect,
    handleFacebookDisconnect,
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

function mapFacebookError(reason: string | null): string {
  switch (reason) {
    case "permissions_denied":
      return "Permisiunile Facebook au fost refuzate.";
    case "no_pages_found":
      return "Contul Facebook autorizat nu administrează nicio pagină disponibilă.";
    case "page_token_missing":
      return "Meta nu a returnat token-ul pentru pagina selectată.";
    case "missing_code":
      return "Callback-ul Facebook nu conține codul de autorizare.";
    case "Facebook Graph API request failed":
      return "Facebook Graph API request failed.";
    case "No active Facebook Messenger connection found":
      return "Nu există o conexiune Facebook Messenger activă.";
    default:
      return reason ?? "A apărut o eroare în timpul conectării Facebook.";
  }
}
