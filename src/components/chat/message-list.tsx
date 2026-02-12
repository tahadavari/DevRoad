"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./message-bubble";
import type { ChatMessageRow } from "./chat-types";
import { Loader2 } from "lucide-react";

interface MessageListProps {
  messages: ChatMessageRow[];
  currentUserId: string;
  loading?: boolean;
  nextCursor: string | null;
  onLoadMore?: () => void;
  onReply?: (message: ChatMessageRow) => void;
}

export function MessageList({
  messages,
  currentUserId,
  loading,
  nextCursor,
  onLoadMore,
  onReply,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <ScrollArea className="flex-1 overflow-y-auto p-4 h-full">
      <div className="flex flex-col gap-3">
        {nextCursor && onLoadMore && (
          <div ref={topRef} className="flex justify-center py-2">
            <button
              type="button"
              onClick={onLoadMore}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              پیام‌های قبلی
            </button>
          </div>
        )}
        {loading && messages.length === 0 ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.senderId === currentUserId}
              onReply={onReply}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
