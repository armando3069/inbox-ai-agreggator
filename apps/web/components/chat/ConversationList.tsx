import type { ConversationViewModel, Channel } from "@/lib/types";
import { PlatformIcon } from "./PlatformIcon";
import { ConversationItem } from "./ConversationItem";

interface ConversationListProps {
  conversations: ConversationViewModel[];
  selectedConversation: ConversationViewModel | null;
  isLoading: boolean;
  conversationFilter: "all" | "unread";
  channels: Channel[];
  selectedChannel: string;
  onSelectChannel: (id: string) => void;
  onSelectConversation: (conv: ConversationViewModel) => void;
  onFilterChange: (filter: "all" | "unread") => void;
}

export function ConversationList({
  conversations,
  selectedConversation,
  isLoading,
  conversationFilter,
  channels,
  selectedChannel,
  onSelectChannel,
  onSelectConversation,
  onFilterChange,
}: ConversationListProps) {
  const unreadCount = conversations.filter((c) => c.unread > 0).length;

  return (
    <div className="w-80 border-r border-[var(--border-default)] flex flex-col bg-white flex-shrink-0 rounded-l-xl">
      <div className="px-4 pt-4 pb-3">
        <h2 className="text-[15px] font-semibold text-[var(--text-primary)] tracking-tight mb-3">Conversații</h2>

        {/* Read/Unread filter */}
        <div className="flex gap-1.5 mb-3">
          <button
            onClick={() => onFilterChange("all")}
            className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all duration-120 ease-out ${
              conversationFilter === "all"
                ? "bg-[var(--accent-primary)] text-white shadow-[var(--shadow-xs)]"
                : "bg-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--border-default)] hover:text-[var(--text-primary)]"
            }`}
          >
            Toate
          </button>
          <button
            onClick={() => onFilterChange("unread")}
            className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all duration-120 ease-out flex items-center gap-1.5 ${
              conversationFilter === "unread"
                ? "bg-[var(--accent-primary)] text-white shadow-[var(--shadow-xs)]"
                : "bg-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--border-default)] hover:text-[var(--text-primary)]"
            }`}
          >
            Necitite
            {unreadCount > 0 && (
              <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none ${
                conversationFilter === "unread"
                  ? "bg-white/20 text-white"
                  : "bg-[var(--accent-primary)] text-white"
              }`}>
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Platform channel filter pills */}

      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="px-4 py-8 text-[12px] text-[var(--text-tertiary)] text-center">Se încarcă...</div>
        )}

        {!isLoading && conversations.length === 0 && (
          <div className="px-4 py-8 text-[12px] text-[var(--text-tertiary)] text-center">Nu există conversații încă.</div>
        )}

        {conversations.map((conv) => (
          <ConversationItem
            key={conv.id}
            conversation={conv}
            isSelected={selectedConversation?.id === conv.id}
            onSelect={onSelectConversation}
          />
        ))}
      </div>
    </div>
  );
}
