"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  CheckCircle2,
  MessageCircle,
  Award,
  Info,
  Loader2,
  CheckCheck,
  Inbox,
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  read: boolean;
  type: string;
  link: string | null;
  createdAt: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  ANSWER_RECEIVED: <MessageCircle className="h-4 w-4 text-blue-500" />,
  ANSWER_ACCEPTED: <Award className="h-4 w-4 text-green-500" />,
  ROLE_UPGRADED: <CheckCircle2 className="h-4 w-4 text-purple-500" />,
  SYSTEM: <Info className="h-4 w-4 text-muted-foreground" />,
};

export default function MessagesPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      fetch("/api/messages")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setMessages(data.data || []);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user, isLoading, router]);

  const markAllRead = async () => {
    try {
      await fetch("/api/messages/read-all", { method: "POST" });
      setMessages(messages.map((m) => ({ ...m, read: true })));
    } catch {
      // ignore
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="h-6 w-6 text-primary" />
          پیام‌ها
        </h1>
        {messages.some((m) => !m.read) && (
          <Button variant="ghost" size="sm" onClick={markAllRead} className="gap-1">
            <CheckCheck className="h-4 w-4" />
            خواندن همه
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : messages.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">پیامی ندارید</h3>
            <p className="text-muted-foreground">
              هنگامی که کسی به سوالتان پاسخ دهد اینجا نمایش داده می‌شود
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {messages.map((msg) => (
            <Card
              key={msg.id}
              className={!msg.read ? "border-primary/30 bg-primary/5" : ""}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <div className="shrink-0">
                  {typeIcons[msg.type] || typeIcons.SYSTEM}
                </div>
                <div className="flex-1 min-w-0">
                  {msg.link ? (
                    <Link
                      href={msg.link}
                      className="text-sm hover:text-primary transition-colors"
                    >
                      {msg.content}
                    </Link>
                  ) : (
                    <p className="text-sm">{msg.content}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(msg.createdAt).toLocaleDateString("fa-IR")}
                  </p>
                </div>
                {!msg.read && (
                  <Badge variant="default" className="shrink-0 text-xs">
                    جدید
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
