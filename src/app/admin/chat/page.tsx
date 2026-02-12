"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "@/components/chat/message-bubble";
import type { ChatMessageRow } from "@/components/chat/chat-types";
import { Shield, MessageCircle, Loader2, ArrowRight } from "lucide-react";

interface AdminConversation {
  id: string;
  userId: string;
  mentorId: string;
  user: { id: string; firstName: string; lastName: string; email: string };
  mentor: { id: string; firstName: string; lastName: string; email: string };
  lastMessage: { id: string; content: string; type: string; createdAt: string } | null;
  updatedAt: string;
}

export default function AdminChatPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const [conversations, setConversations] = useState<AdminConversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageRow[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "ADMIN")) {
      router.push("/");
      return;
    }
    if (user?.role === "ADMIN") {
      fetch("/api/admin/chat/conversations")
        .then((r) => r.json())
        .then((d) => d.success && setConversations(d.data || []))
        .finally(() => setLoadingList(false));
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }
    setLoadingMessages(true);
    fetch(`/api/admin/chat/conversations/${selectedId}/messages`)
      .then((r) => r.json())
      .then((d) => d.success && setMessages(d.data || []))
      .finally(() => setLoadingMessages(false));
  }, [selectedId]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const selected = conversations.find((c) => c.id === selectedId);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">مشاهده همه چت‌ها</h1>
          <p className="text-sm text-muted-foreground">ادمین می‌تواند تمام مکالمات کاربران با منتورها را ببیند.</p>
        </div>
      </div>

      <div className="flex h-[calc(100vh-12rem)] gap-4 overflow-hidden rounded-lg border">
        <Card className="w-96 shrink-0 overflow-hidden rounded-none border-0 border-l">
          <CardHeader className="py-3">
            <CardTitle className="text-base">مکالمات ({conversations.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loadingList ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                هیچ مکالمه‌ای وجود ندارد.
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-18rem)]">
                <ul className="divide-y">
                  {conversations.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(c.id)}
                        className={`flex w-full items-center gap-3 px-4 py-3 text-right transition-colors hover:bg-muted/50 ${
                          selectedId === c.id ? "bg-muted" : ""
                        }`}
                      >
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarFallback>
                            {c.user.firstName[0]}
                            {c.mentor.firstName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1 text-right">
                          <p className="truncate text-sm font-medium">
                            {c.user.firstName} {c.user.lastName}
                            <span className="text-muted-foreground"> با </span>
                            {c.mentor.firstName} {c.mentor.lastName}
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
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-1 flex-col min-w-0 bg-muted/20">
          {selected ? (
            <>
              <div className="flex items-center gap-3 border-b bg-background px-4 py-3">
                <MessageCircle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {selected.user.firstName} {selected.user.lastName}
                    <span className="text-muted-foreground"> (کاربر) — </span>
                    {selected.mentor.firstName} {selected.mentor.lastName}
                    <span className="text-muted-foreground"> (منتور)</span>
                  </p>
                  <p className="text-xs text-muted-foreground" dir="ltr">
                    {selected.user.email} / {selected.mentor.email}
                  </p>
                </div>
              </div>
              <ScrollArea className="flex-1 p-4">
                {loadingMessages ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {messages.map((msg) => (
                      <MessageBubble
                        key={msg.id}
                        message={msg}
                        isOwn={msg.senderId === user.id}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-muted-foreground">
              <p>یک مکالمه از لیست انتخاب کنید.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
