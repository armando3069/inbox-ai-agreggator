"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bot, BookOpen } from "lucide-react";
import { useAiConfig } from "@/hooks/useAiConfig";
import { useKnowledgeBase } from "@/hooks/useKnowledgeBase";
import ConfigurationTab from "@/components/ai-assistant/ConfigurationTab";
import KnowledgeBaseTab from "@/components/ai-assistant/KnowledgeBaseTab";

export default function AiAssistantPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"configuration" | "knowledge">("configuration");

  const config = useAiConfig();
  const kb = useKnowledgeBase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Înapoi
          </button>

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-lg">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">AI Assistant</h1>
              <p className="text-sm text-slate-500">
                Configurează asistentul inteligent pentru conversații
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => setActiveTab("configuration")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
              activeTab === "configuration"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Bot className="h-4 w-4" />
            Configuration
          </button>
          <button
            onClick={() => setActiveTab("knowledge")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
              activeTab === "knowledge"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Knowledge Base
          </button>
        </div>

        {/* Tab content */}
        {activeTab === "configuration" && <ConfigurationTab config={config} />}
        {activeTab === "knowledge" && <KnowledgeBaseTab kb={kb} />}
      </div>
    </div>
  );
}
