"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/lib/store";
import { MessageSquare, Send } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: { firstName: string; lastName: string };
}

export function BlogComments({ blogSlug }: { blogSlug: string }) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => {
    fetch(`/api/blog/${blogSlug}/comments`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.data)) setComments(d.data);
      })
      .finally(() => setLoadingList(false));
  }, [blogSlug]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/blog/${blogSlug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setComments((prev) => [data.data, ...prev]);
        setContent("");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
        <MessageSquare className="h-5 w-5" />
        نظرات ({comments.length})
      </h2>

      {user && (
        <form onSubmit={submit} className="mb-6">
          <Textarea
            placeholder="نظر شما..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="mb-2"
          />
          <Button type="submit" disabled={loading}>
            <Send className="h-4 w-4" />
            ارسال نظر
          </Button>
        </form>
      )}

      {!user && (
        <p className="mb-4 text-sm text-muted-foreground">
          برای ثبت نظر وارد شوید.
        </p>
      )}

      {loadingList ? (
        <p className="text-muted-foreground">در حال بارگذاری نظرات...</p>
      ) : comments.length === 0 ? (
        <p className="text-muted-foreground">هنوز نظری ثبت نشده.</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((c) => (
            <li
              key={c.id}
              className="rounded-lg border bg-muted/30 p-4"
            >
              <p className="text-sm font-medium">
                {c.user.firstName} {c.user.lastName}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {new Date(c.createdAt).toLocaleDateString("fa-IR")}
              </p>
              <p className="mt-2">{c.content}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
