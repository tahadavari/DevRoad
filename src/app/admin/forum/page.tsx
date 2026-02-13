"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";

interface PendingQuestion {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  forum: { roadmapSlug: string };
  user: { firstName: string; lastName: string };
}

interface PendingBlogComment {
  id: string;
  blogSlug: string;
  content: string;
  createdAt: string;
  user: { firstName: string; lastName: string };
}

interface PendingAnswer {
  id: string;
  content: string;
  createdAt: string;
  question: { id: string; title: string; forum: { roadmapSlug: string } };
  user: { firstName: string; lastName: string };
}

export default function AdminForumModerationPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<PendingQuestion[]>([]);
  const [answers, setAnswers] = useState<PendingAnswer[]>([]);
  const [comments, setComments] = useState<PendingBlogComment[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [qRes, aRes, cRes] = await Promise.all([
        fetch("/api/admin/forum/questions"),
        fetch("/api/admin/forum/answers"),
        fetch("/api/admin/blog/comments"),
      ]);
      const [qData, aData, cData] = await Promise.all([
        qRes.json(),
        aRes.json(),
        cRes.json(),
      ]);
      if (qData.success) setQuestions(qData.data || []);
      if (aData.success) setAnswers(aData.data || []);
      if (cData.success) setComments(cData.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== "ADMIN") {
        router.push("/");
        return;
      }
      fetchData();
    }
  }, [user, isLoading, router]);

  const updateQuestionStatus = async (questionId: string, status: "APPROVED" | "REJECTED") => {
    setBusyId(questionId);
    try {
      const res = await fetch("/api/admin/forum/questions/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, status }),
      });
      if (res.ok) {
        setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      }
    } finally {
      setBusyId(null);
    }
  };

  const updateCommentStatus = async (commentId: string, status: "APPROVED" | "REJECTED") => {
    setBusyId(commentId);
    try {
      const res = await fetch("/api/admin/blog/comments/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, status }),
      });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    } finally {
      setBusyId(null);
    }
  };

  const updateAnswerStatus = async (answerId: string, status: "APPROVED" | "REJECTED") => {
    setBusyId(answerId);
    try {
      const res = await fetch("/api/admin/forum/answers/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answerId, status }),
      });
      if (res.ok) {
        setAnswers((prev) => prev.filter((a) => a.id !== answerId));
      }
    } finally {
      setBusyId(null);
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
    <div className="container mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">مدیریت انتشار فوروم</h1>
        <Link href="/admin">
          <Button variant="outline" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            بازگشت
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>سوالات در انتظار تایید ({questions.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : questions.map((q) => (
            <div key={q.id} className="border rounded-lg p-3 space-y-2">
              <p className="font-medium">{q.title}</p>
              <p className="text-sm text-muted-foreground">{q.content}</p>
              <p className="text-xs text-muted-foreground">{q.user.firstName} {q.user.lastName} - {q.forum.roadmapSlug}</p>
              <div className="flex gap-2">
                <Button size="sm" disabled={busyId === q.id} onClick={() => updateQuestionStatus(q.id, "APPROVED")}>تایید</Button>
                <Button size="sm" variant="destructive" disabled={busyId === q.id} onClick={() => updateQuestionStatus(q.id, "REJECTED")}>رد</Button>
              </div>
            </div>
          ))}
          {!loading && questions.length === 0 && <p className="text-sm text-muted-foreground">موردی وجود ندارد.</p>}
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle>کامنت‌های بلاگ در انتظار تایید ({comments.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : comments.map((c) => (
            <div key={c.id} className="border rounded-lg p-3 space-y-2">
              <p className="text-sm text-muted-foreground">بلاگ: {c.blogSlug}</p>
              <p className="text-sm">{c.content}</p>
              <p className="text-xs text-muted-foreground">{c.user.firstName} {c.user.lastName}</p>
              <div className="flex gap-2">
                <Button size="sm" disabled={busyId === c.id} onClick={() => updateCommentStatus(c.id, "APPROVED")}>تایید</Button>
                <Button size="sm" variant="destructive" disabled={busyId === c.id} onClick={() => updateCommentStatus(c.id, "REJECTED")}>رد</Button>
              </div>
            </div>
          ))}
          {!loading && comments.length === 0 && <p className="text-sm text-muted-foreground">موردی وجود ندارد.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>پاسخ‌های در انتظار تایید ({answers.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : answers.map((a) => (
            <div key={a.id} className="border rounded-lg p-3 space-y-2">
              <p className="text-sm text-muted-foreground">برای سوال: {a.question.title}</p>
              <p className="text-sm">{a.content}</p>
              <p className="text-xs text-muted-foreground">{a.user.firstName} {a.user.lastName} - {a.question.forum.roadmapSlug}</p>
              <div className="flex gap-2">
                <Button size="sm" disabled={busyId === a.id} onClick={() => updateAnswerStatus(a.id, "APPROVED")}>تایید</Button>
                <Button size="sm" variant="destructive" disabled={busyId === a.id} onClick={() => updateAnswerStatus(a.id, "REJECTED")}>رد</Button>
              </div>
            </div>
          ))}
          {!loading && answers.length === 0 && <p className="text-sm text-muted-foreground">موردی وجود ندارد.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
