"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { ConversationListItem } from "./chat-types";
import { MessageCircle } from "lucide-react";

interface ConversationListProps {
  conversations: ConversationListItem[];
  selectedId: string | null;
  onSelect: (conv: ConversationListItem) => void;
  loading?: boolean;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  loading,
}: ConversationListProps) {
  if (loading) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        در حال بارگذاری...
      </div>
    );
  }
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-8 text-center text-sm text-muted-foreground">
        <MessageCircle className="h-10 w-10" />
        <p>هنوز مکالمه‌ای ندارید. از لیست منتورها یکی را انتخاب کنید.</p>
      </div>
    );
  }
  return (
    <ul className="divide-y">
      {conversations.map((c) => (
        <li key={c.id}>
          <button
            type="button"
            className={cn(
              "flex w-full items-center gap-3 px-4 py-3 text-right transition-colors hover:bg-muted/50",
              selectedId === c.id && "bg-muted"
            )}
            onClick={() => onSelect(c)}
          >
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarFallback className="text-sm">
                {c.other.firstName[0]}
                {c.other.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 text-right">
              <p className="truncate font-medium">
                {c.other.firstName} {c.other.lastName}
              </p>
              {c.lastMessage && (
                <p className="truncate text-xs text-muted-foreground">
                  {c.lastMessage.content}
                </p>
              )}
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}
