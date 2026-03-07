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
      <div className="p-4 border-b border-slate-200 bg-white">
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
              <h3 className="font-semibold text-slate-800 truncate">{conversation.contact}</h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                <LifecycleDropdown
                    current={conversation.lifecycleStatus ?? "NEW_LEAD"}
                    onSelect={handleLifecycleChange}
                />
              </div>
            </div>
          </div>

          {/* Right — lifecycle badge + edit contact + star + archive */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setIsEditOpen(true)}
              title="Edit Contact Info"
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Pencil className="w-4 h-4 text-slate-500" />
            </button>

            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Star className="w-5 h-5 text-slate-600" />
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Archive className="w-5 h-5 text-slate-600" />
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
