"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getAiConfig,
  updateAiConfig,
  type AiAssistantConfig,
  type ResponseTone,
} from "@/services/api/api";

export interface UseAiConfigReturn {
  configLoading: boolean;
  autoReply: boolean;
  tone: ResponseTone;
  threshold: number;
  savingConfig: boolean;
  configError: string | null;
  setToneState: (v: ResponseTone) => void;
  setThresholdState: (v: number) => void;
  saveConfig: (
    patch: Partial<
      Pick<
        AiAssistantConfig,
        "autoReplyEnabled" | "responseTone" | "confidenceThreshold"
      >
    >,
  ) => Promise<void>;
}

export function useAiConfig(): UseAiConfigReturn {
  const [configLoading, setConfigLoading] = useState(true);
  const [autoReply, setAutoReplyState] = useState(false);
  const [tone, setToneState] = useState<ResponseTone>("professional");
  const [threshold, setThresholdState] = useState(70);
  const [savingConfig, setSavingConfig] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    getAiConfig()
      .then((cfg: AiAssistantConfig) => {
        setAutoReplyState(cfg.autoReplyEnabled);
        setToneState(cfg.responseTone);
        setThresholdState(cfg.confidenceThreshold);
      })
      .catch(() => {
        /* silently ignore — API may not be ready */
      })
      .finally(() => setConfigLoading(false));
  }, []);

  const saveConfig = useCallback(
    async (
      patch: Partial<
        Pick<
          AiAssistantConfig,
          "autoReplyEnabled" | "responseTone" | "confidenceThreshold"
        >
      >,
    ) => {
      setSavingConfig(true);
      setConfigError(null);
      try {
        const updated = await updateAiConfig(patch);
        setAutoReplyState(updated.autoReplyEnabled);
        setToneState(updated.responseTone);
        setThresholdState(updated.confidenceThreshold);
      } catch {
        setConfigError("Nu s-a putut salva configurația. Încearcă din nou.");
      } finally {
        setSavingConfig(false);
      }
    },
    [],
  );

  return {
    configLoading,
    autoReply,
    tone,
    threshold,
    savingConfig,
    configError,
    setToneState,
    setThresholdState,
    saveConfig,
  };
}
