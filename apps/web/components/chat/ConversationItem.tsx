import { Tag } from "lucide-react";
import type { ConversationViewModel } from "@/lib/types";
import { getSentimentColor, getSentimentLabel } from "@/lib/chatUtils";
import { getLifecycleStage } from "@/lib/lifecycle";
import { AvatarWithPlatformBadge } from "./AvatarWithPlatformBadge";

interface ConversationItemProps {
  conversation: ConversationViewModel;
  isSelected: boolean;
  onSelect: (conv: ConversationViewModel) => void;
}

export function ConversationItem({ conversation: conv, isSelected, onSelect }: ConversationItemProps) {
  return (
    <div
      onClick={() => onSelect(conv)}
      className={`relative px-5 py-3.5 cursor-pointer transition-colors hover:bg-[var(--bg-surface-hover)] border-b border-[var(--border-subtle)] ${
        isSelected ? "bg-[var(--bg-surface-hover)]" : ""
      }`}
    >
      {/* Active indicator */}
      {isSelected && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-8 rounded-r-full bg-[var(--accent-primary)]" />
      )}

      <div className="flex gap-3">
        <AvatarWithPlatformBadge
          name={conv.contact}
          avatar={conv.avatar}
          platform={conv.platform}
          size="lg"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-0.5">
            <h3 className={`text-[13px] truncate ${conv.unread > 0 ? "font-semibold text-[var(--text-primary)]" : "font-medium text-[var(--text-primary)]"}`}>
              {conv.contact}
            </h3>
            <span className={`text-[11px] ml-2 flex-shrink-0 ${conv.unread > 0 ? "font-medium text-[var(--text-secondary)]" : "text-[var(--text-tertiary)]"}`}>
              {conv.time}
            </span>
          </div>

          <p className={`text-[12px] line-clamp-1 mb-2 ${conv.unread > 0 ? "text-[var(--text-primary)] font-medium" : "text-[var(--text-secondary)]"}`}>
            {conv.lastMessage}
          </p>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[11px] px-2 py-0.5 rounded-md border ${getSentimentColor(conv.sentiment)}`}
            >
              {getSentimentLabel(conv.sentiment)}
            </span>
            {(() => {
              const stage = getLifecycleStage(conv.lifecycleStatus);
              return (
                <span className={`text-[11px] px-2 py-0.5 rounded-md border ${stage.badgeClass}`}>
                  {stage.emoji} {stage.label}
                </span>
              );
            })()}
            {conv.unread > 0 && (
              <span className="ml-auto text-[10px] px-1.5 py-0.5 bg-[var(--accent-primary)] text-white rounded-md font-medium">
                {conv.unread}
              </span>
            )}
          </div>

          {conv.entities.length > 0 && (
            <div className="mt-1.5 flex items-center gap-1 text-[11px] text-[var(--text-tertiary)]">
              <Tag className="w-3 h-3" />
              <span className="truncate">{conv.entities[0]}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
