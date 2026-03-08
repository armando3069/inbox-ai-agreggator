"use client";

import { useState } from "react";
import { Bot, BookOpen } from "lucide-react";
import { useAiConfig } from "@/hooks/useAiConfig";
import { useKnowledgeBase } from "@/hooks/useKnowledgeBase";
import ConfigurationTab from "@/components/ai-assistant/ConfigurationTab";
import KnowledgeBaseTab from "@/components/ai-assistant/KnowledgeBaseTab";
import { PageHeader } from "@/components/layout/PageHeader";

export default function AiAssistantPage() {
  const [activeTab, setActiveTab] = useState<"configuration" | "knowledge">("configuration");

  const config = useAiConfig();
  const kb = useKnowledgeBase();

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--bg-page)]">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-6">
            <PageHeader
              icon={Bot}
              title="AI Assistant"
              description="Configurează asistentul inteligent pentru conversații"
            />
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-1 rounded-[var(--radius-button)] bg-[var(--border-subtle)] p-1">
            <button
              onClick={() => setActiveTab("configuration")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-[var(--radius-badge)] py-2.5 text-[13px] font-medium transition-all ${
                activeTab === "configuration"
                  ? "bg-white text-[var(--text-primary)] shadow-[var(--shadow-sm)]"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              }`}
            >
              <Bot className="h-4 w-4" />
              Configuration
            </button>
            <button
              onClick={() => setActiveTab("knowledge")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-[var(--radius-badge)] py-2.5 text-[13px] font-medium transition-all ${
                activeTab === "knowledge"
                  ? "bg-white text-[var(--text-primary)] shadow-[var(--shadow-sm)]"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
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
    </div>
  );
}
