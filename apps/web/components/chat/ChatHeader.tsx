"use client";

import { useState } from "react";
import { Star, Archive, Pencil } from "lucide-react";
import type { ConversationViewModel } from "@/lib/types";
import type { ContactInfoPatch } from "@/services/conversations/conversations.types";
import { AvatarWithPlatformBadge } from "./AvatarWithPlatformBadge";
import { LifecycleDropdown } from "./LifecycleDropdown";
import { EditContactModal } from "./EditContactModal";

interface ChatHeaderProps {
  conversation: ConversationViewModel;
  onUpdateConversation: (id: number, patch: ContactInfoPatch) => Promise<void>;
}

export function ChatHeader({ conversation, onUpdateConversation }: ChatHeaderProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleLifecycleChange = (value: string) => {
    void onUpdateConversation(conversation.id, { lifecycleStatus: value });
  };

  const handleContactSave = (patch: ContactInfoPatch) =>
    onUpdateConversation(conversation.id, patch);

  return (
    <>
      <div className="px-5 py-3.5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="flex items-center justify-between gap-3">
          {/* Left — avatar + name + platform */}
          <div className="flex items-center gap-3 min-w-0">
            <AvatarWithPlatformBadge
              name={conversation.contact}
              avatar={conversation.avatar}
              platform={conversation.platform}
              size="md"
            />
            <div className="w-full">
              <h3 className="font-medium text-[15px] text-[var(--text-primary)] truncate">{conversation.contact}</h3>
              <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] flex-wrap">
                <LifecycleDropdown
                    current={conversation.lifecycleStatus ?? "NEW_LEAD"}
                    onSelect={handleLifecycleChange}
                />
              </div>
            </div>
          </div>

          {/* Right — edit contact + star + archive */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setIsEditOpen(true)}
              title="Edit Contact Info"
              className="p-2 hover:bg-[var(--bg-surface-hover)] rounded-[var(--radius-badge)] transition-colors"
            >
              <Pencil className="w-4 h-4 text-[var(--text-tertiary)]" />
            </button>

            <button className="p-2 hover:bg-[var(--bg-surface-hover)] rounded-[var(--radius-badge)] transition-colors">
              <Star className="w-4 h-4 text-[var(--text-tertiary)]" />
            </button>
            <button className="p-2 hover:bg-[var(--bg-surface-hover)] rounded-[var(--radius-badge)] transition-colors">
              <Archive className="w-4 h-4 text-[var(--text-tertiary)]" />
            </button>
          </div>
        </div>
      </div>

      {isEditOpen && (
        <EditContactModal
          conversation={conversation}
          onSave={handleContactSave}
          onClose={() => setIsEditOpen(false)}
        />
      )}
    </>
  );
}
