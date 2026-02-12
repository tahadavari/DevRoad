"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { MentorList } from "@/components/chat/mentor-list";
import { ConversationList } from "@/components/chat/conversation-list";
import { MessageList } from "@/components/chat/message-list";
import { MessageInput } from "@/components/chat/message-input";
import type {
  ConversationListItem,
  ConversationDetail,
  ChatMessageRow,
} from "@/components/chat/chat-types";
import type { MentorItem } from "@/components/chat/mentor-list";
import { Loader2, MessageCircle, ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function ChatPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const [mentors, setMentors] = useState<MentorItem[]>([]);
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationListItem | null>(null);
  const [conversationDetail, setConversationDetail] = useState<ConversationDetail | null>(null);
  const [messages, setMessages] = useState<ChatMessageRow[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<ChatMessageRow | null>(null);
  const [loadingMentors, setLoadingMentors] = useState(true);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showMentors, setShowMentors] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      fetch("/api/chat/mentors")
        .then((r) => r.json())
        .then((d) => d.success && setMentors(d.data || []))
        .finally(() => setLoadingMentors(false));
      fetch("/api/chat/conversations")
        .then((r) => r.json())
        .then((d) => d.success && setConversations(d.data || []))
        .finally(() => setLoadingConvs(false));
    }
  }, [user, authLoading, router]);

  const loadConversation = useCallback(
    async (conv: ConversationListItem) => {
      setSelectedConversation(conv);
      setConversationDetail(null);
      setMessages([]);
      setNextCursor(null);
      setLoadingMessages(true);
      try {
        const res = await fetch(
          `/api/chat/conversations/${conv.id}/messages?limit=50`
        );
        const data = await res.json();
        if (data.success) {
          setMessages(data.data || []);
          setNextCursor(data.nextCursor ?? null);
        }
        setConversationDetail({
          id: conv.id,
          userId: conv.userId,
          mentorId: conv.mentorId,
          user: conv.other,
          mentor: conv.other,
          createdAt: conv.updatedAt,
        });
      } finally {
        setLoadingMessages(false);
      }
    },
    []
  );

  const startChatWithMentor = useCallback(
    async (mentor: MentorItem) => {
      try {
        const res = await fetch("/api/chat/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mentorId: mentor.id }),
        });
        const data = await res.json();
        if (!data.success) return;
        const convData = data.data;
        const newConv: ConversationListItem = {
          id: convData.id,
          userId: convData.userId,
          mentorId: convData.mentorId,
          other: convData.mentor,
          lastMessage: null,
          updatedAt: convData.createdAt,
        };
        setConversations((prev) => [newConv, ...prev.filter((c) => c.id !== newConv.id)]);
        setShowMentors(false);
        loadConversation(newConv);
      } catch {
        // ignore
      }
    },
    [loadConversation]
  );

  const loadMoreMessages = useCallback(() => {
    if (!selectedConversation || !nextCursor) return;
    fetch(
      `/api/chat/conversations/${selectedConversation.id}/messages?cursor=${nextCursor}&limit=50`
    )
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data?.length) {
          setMessages((prev) => [...d.data, ...prev]);
          setNextCursor(d.nextCursor ?? null);
        }
      });
  }, [selectedConversation, nextCursor]);

  const sendMessage = useCallback(
    async (payload: {
      type: string;
      content: string;
      fileUrl?: string;
      replyToId?: string;
    }) => {
      if (!selectedConversation) return;
      const res = await fetch(
        `/api/chat/conversations/${selectedConversation.id}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (data.success && data.data) {
        setMessages((prev) => [...prev, data.data]);
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedConversation.id
              ? {
                  ...c,
                  lastMessage: {
                    id: data.data.id,
                    content: data.data.content,
                    type: data.data.type,
                    createdAt: data.data.createdAt,
                    sender: data.data.sender,
                  },
                  updatedAt: data.data.createdAt,
                }
              : c
          )
        );
      }
    },
    [selectedConversation]
  );

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const otherUser = selectedConversation?.other;

  return (
    <div className="container mx-auto flex h-[calc(100vh-4rem)] max-w-6xl gap-0 overflow-hidden rounded-lg border bg-card shadow-sm">
      {/* سایدبار */}
      <div className="flex w-80 shrink-0 flex-col border-l bg-muted/30">
        <div className="flex border-b bg-background p-2">
          <button
            type="button"
            onClick={() => setShowMentors(!showMentors)}
            className="flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            <MessageCircle className="h-4 w-4" />
            {showMentors ? "مکالمات" : "منتورها"}
          </button>
        </div>
        {showMentors ? (
          <Card className="m-2 flex-1 overflow-hidden rounded-lg border-0 bg-background p-0">
            <div className="border-b px-3 py-2 text-sm font-medium">شروع چت با منتور</div>
            <MentorList
              mentors={mentors}
              selectedId={null}
              onSelect={startChatWithMentor}
              loading={loadingMentors}
            />
          </Card>
        ) : (
          <Card className="m-2 flex-1 overflow-hidden rounded-lg border-0 bg-background p-0">
            <ConversationList
              conversations={conversations}
              selectedId={selectedConversation?.id ?? null}
              onSelect={loadConversation}
              loading={loadingConvs}
            />
          </Card>
        )}
      </div>

      {/* ناحیه چت */}
      <div className="flex flex-1 flex-col min-w-0 bg-background">
        {selectedConversation && otherUser ? (
          <>
            <div className="flex items-center gap-3 border-b px-4 py-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback>
                  {otherUser.firstName[0]}
                  {otherUser.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">
                  {otherUser.firstName} {otherUser.lastName}
                </p>
                <p className="text-xs text-muted-foreground">منتور</p>
              </div>
            </div>
            <MessageList
              messages={messages}
              currentUserId={user.id}
              loading={loadingMessages}
              nextCursor={nextCursor}
              onLoadMore={loadMoreMessages}
              onReply={setReplyTo}
            />
            <MessageInput
              onSend={sendMessage}
              replyTo={replyTo}
              onClearReply={() => setReplyTo(null)}
            />
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground">
            <MessageCircle className="h-16 w-16 opacity-50" />
            <p>یک منتور انتخاب کنید یا مکالمه را از لیست باز کنید.</p>
            <button
              type="button"
              onClick={() => setShowMentors(true)}
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <ArrowRight className="h-4 w-4" />
              مشاهده لیست منتورها
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
