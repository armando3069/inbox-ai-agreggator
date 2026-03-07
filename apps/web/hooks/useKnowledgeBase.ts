"use client";

import { useRef, useState, useCallback } from "react";
import {
  uploadKnowledgePdf,
  askKnowledge,
  getKnowledgeFiles,
  clearKnowledge,
  type IndexedFile,
} from "@/services/api/api";

export type UploadStatus =
  | null
  | { state: "uploading"; name: string }
  | { state: "done"; name: string; chunks: number }
  | { state: "error"; message: string };

export interface UseKnowledgeBaseReturn {
  kbFiles: IndexedFile[];
  kbFilesLoading: boolean;
  isDragging: boolean;
  setIsDragging: (v: boolean) => void;
  uploadStatus: UploadStatus;
  setUploadStatus: (v: UploadStatus) => void;
  kbQuestion: string;
  setKbQuestion: (v: string) => void;
  kbAnswer: string | null;
  kbAnswerLoading: boolean;
  kbAnswerError: string | null;
  clearingKb: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  loadKbFiles: () => Promise<void>;
  handlePdfUpload: (file: File) => Promise<void>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleKbAsk: () => Promise<void>;
  handleClearKb: () => Promise<void>;
}

export function useKnowledgeBase(): UseKnowledgeBaseReturn {
  const [kbFiles, setKbFiles] = useState<IndexedFile[]>([]);
  const [kbFilesLoading, setKbFilesLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>(null);
  const [kbQuestion, setKbQuestion] = useState("");
  const [kbAnswer, setKbAnswer] = useState<string | null>(null);
  const [kbAnswerLoading, setKbAnswerLoading] = useState(false);
  const [kbAnswerError, setKbAnswerError] = useState<string | null>(null);
  const [clearingKb, setClearingKb] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadKbFiles = useCallback(async () => {
    setKbFilesLoading(true);
    try {
      const { files } = await getKnowledgeFiles();
      setKbFiles(files);
    } catch {
      // Not critical
    } finally {
      setKbFilesLoading(false);
    }
  }, []);

  const handlePdfUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setUploadStatus({ state: "error", message: "Doar fișiere PDF sunt acceptate." });
      return;
    }
    setUploadStatus({ state: "uploading", name: file.name });
    try {
      const result = await uploadKnowledgePdf(file);
      setUploadStatus({ state: "done", name: result.file, chunks: result.chunks });
      const { files } = await getKnowledgeFiles();
      setKbFiles(files);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload eșuat.";
      setUploadStatus({ state: "error", message: msg });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handlePdfUpload(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handlePdfUpload(file);
  };

  const handleKbAsk = async () => {
    if (!kbQuestion.trim()) return;
    setKbAnswerLoading(true);
    setKbAnswer(null);
    setKbAnswerError(null);
    try {
      const { answer } = await askKnowledge(kbQuestion.trim());
      setKbAnswer(answer);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Eroare la generarea răspunsului.";
      setKbAnswerError(msg);
    } finally {
      setKbAnswerLoading(false);
    }
  };

  const handleClearKb = async () => {
    setClearingKb(true);
    try {
      await clearKnowledge();
      setKbFiles([]);
      setKbAnswer(null);
      setUploadStatus(null);
    } catch {
      /* ignore */
    } finally {
      setClearingKb(false);
    }
  };

  return {
    kbFiles,
    kbFilesLoading,
    isDragging,
    setIsDragging,
    uploadStatus,
    setUploadStatus,
    kbQuestion,
    setKbQuestion,
    kbAnswer,
    kbAnswerLoading,
    kbAnswerError,
    clearingKb,
    fileInputRef,
    loadKbFiles,
    handlePdfUpload,
    handleInputChange,
    handleDrop,
    handleKbAsk,
    handleClearKb,
  };
}
