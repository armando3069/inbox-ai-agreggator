import type { Message } from "@/lib/types";
import { MessageBubble } from "./MessageBubble";

interface MessagesListProps {
  messages: Message[];
  isLoading: boolean;
  avatar: string;
}

export function MessagesList({ messages, isLoading, avatar }: MessagesListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[var(--bg-page)]">
      <div className="max-w-4xl mx-auto space-y-4">
        {isLoading && (
          <div className="text-[12px] text-[var(--text-tertiary)] text-center">Se încarcă mesajele...</div>
        )}

        {!isLoading && messages.length === 0 && (
          <div className="text-[12px] text-[var(--text-tertiary)] text-center">Nu există mesaje încă.</div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} avatar={avatar} />
        ))}
      </div>
    </div>
  );
}
