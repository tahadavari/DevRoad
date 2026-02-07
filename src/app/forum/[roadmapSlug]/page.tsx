"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MessageSquare,
  Plus,
  Loader2,
  Clock,
  MessageCircle,
  ArrowLeft,
  X,
  BadgeCheck,
} from "lucide-react";

interface Question {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  _count: {
    answers: number;
  };
}

export default function ForumPage() {
  const params = useParams();
  const router = useRouter();
  const roadmapSlug = params.roadmapSlug as string;
  const { user } = useAuthStore();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ title: "", content: "" });

  useEffect(() => {
    fetch(`/api/forum/${roadmapSlug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setQuestions(data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [roadmapSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/forum/${roadmapSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newQuestion),
      });
      const data = await res.json();
      if (data.success) {
        setQuestions([data.data, ...questions]);
        setNewQuestion({ title: "", content: "" });
        setShowForm(false);
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            فوروم {roadmapSlug}
          </h1>
          <p className="text-muted-foreground mt-1">
            سوالات و بحث‌های مرتبط با این مسیر
          </p>
        </div>
        <Button
          onClick={() => (user ? setShowForm(!showForm) : router.push("/login"))}
          className="gap-2"
        >
          {showForm ? (
            <>
              <X className="h-4 w-4" /> انصراف
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" /> سوال جدید
            </>
          )}
        </Button>
      </div>

      {/* New Question Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">سوال جدید</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label>عنوان سوال</Label>
                <Input
                  value={newQuestion.title}
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, title: e.target.value })
                  }
                  placeholder="عنوان سوال خود را بنویسید..."
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>توضیحات</Label>
                <Textarea
                  value={newQuestion.content}
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, content: e.target.value })
                  }
                  placeholder="سوال خود را با جزئیات بنویسید..."
                  rows={5}
                  required
                />
              </div>
              <Button type="submit" disabled={submitting} className="gap-2">
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MessageSquare className="h-4 w-4" />
                )}
                ارسال سوال
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Questions List */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : questions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">هنوز سوالی پرسیده نشده</h3>
            <p className="text-muted-foreground">اولین نفر باشید!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <Link key={q.id} href={`/forum/${roadmapSlug}/${q.id}`}>
              <Card className="hover:shadow-md transition-all hover:border-primary/30 cursor-pointer">
                <CardContent className="flex items-start gap-4 p-5">
                  <Avatar className="mt-1">
                    <AvatarFallback>{q.user.firstName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium">{q.title}</h3>
                      {(q.user.role === "MENTOR" || q.user.role === "ADMIN") && (
                        <BadgeCheck className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                      {q.content}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>
                        {q.user.firstName} {q.user.lastName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(q.createdAt).toLocaleDateString("fa-IR")}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {q._count.answers} پاسخ
                      </span>
                    </div>
                  </div>
                  <ArrowLeft className="h-4 w-4 text-muted-foreground shrink-0 mt-2" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
