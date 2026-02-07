"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  BadgeCheck,
  Loader2,
  Send,
  Clock,
} from "lucide-react";

interface Answer {
  id: string;
  content: string;
  isAccepted: boolean;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  _count?: {
    likes: number;
    dislikes: number;
  };
  likes: number;
  dislikes: number;
  userVote: "LIKE" | "DISLIKE" | null;
}

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
}

export default function QuestionPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const questionId = params.questionId as string;
  const roadmapSlug = params.roadmapSlug as string;

  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAnswer, setNewAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/forum/${roadmapSlug}/${questionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setQuestion(data.data.question);
          setAnswers(data.data.answers || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [roadmapSlug, questionId]);

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/forum/${roadmapSlug}/${questionId}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newAnswer }),
      });
      const data = await res.json();
      if (data.success) {
        setAnswers([...answers, data.data]);
        setNewAnswer("");
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (answerId: string, type: "LIKE" | "DISLIKE") => {
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      const res = await fetch(`/api/forum/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answerId, type }),
      });
      const data = await res.json();
      if (data.success) {
        setAnswers(
          answers.map((a) =>
            a.id === answerId
              ? { ...a, likes: data.data.likes, dislikes: data.data.dislikes, userVote: data.data.userVote }
              : a
          )
        );
      }
    } catch {
      // ignore
    }
  };

  const handleAccept = async (answerId: string) => {
    if (!user || !question || question.user.id !== user.id) return;
    try {
      const res = await fetch(`/api/forum/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answerId }),
      });
      if (res.ok) {
        setAnswers(
          answers.map((a) => ({ ...a, isAccepted: a.id === answerId }))
        );
      }
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <p>سوال یافت نشد</p>
      </div>
    );
  }

  // Sort answers: mentor/admin answers first, then accepted, then by likes
  const sortedAnswers = [...answers].sort((a, b) => {
    if (a.user.role === "MENTOR" || a.user.role === "ADMIN") return -1;
    if (b.user.role === "MENTOR" || b.user.role === "ADMIN") return 1;
    if (a.isAccepted) return -1;
    if (b.isAccepted) return 1;
    return (b.likes - b.dislikes) - (a.likes - a.dislikes);
  });

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      {/* Question */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start gap-3">
            <Avatar>
              <AvatarFallback>{question.user.firstName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-xl mb-1">{question.title}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  {question.user.firstName} {question.user.lastName}
                </span>
                {(question.user.role === "MENTOR" ||
                  question.user.role === "ADMIN") && (
                  <BadgeCheck className="h-4 w-4 text-blue-500" />
                )}
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(question.createdAt).toLocaleDateString("fa-IR")}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap leading-relaxed">{question.content}</p>
        </CardContent>
      </Card>

      {/* Answers */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">
          {answers.length} پاسخ
        </h2>
        <div className="space-y-4">
          {sortedAnswers.map((answer) => (
            <Card
              key={answer.id}
              className={
                answer.isAccepted
                  ? "border-green-500 bg-green-50/50 dark:bg-green-950/20"
                  : ""
              }
            >
              <CardContent className="p-5">
                <div className="flex gap-4">
                  {/* Vote buttons */}
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleVote(answer.id, "LIKE")}
                      className={`p-1 rounded hover:bg-muted transition-colors ${
                        answer.userVote === "LIKE" ? "text-green-500" : "text-muted-foreground"
                      }`}
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-medium">
                      {(answer.likes || 0) - (answer.dislikes || 0)}
                    </span>
                    <button
                      onClick={() => handleVote(answer.id, "DISLIKE")}
                      className={`p-1 rounded hover:bg-muted transition-colors ${
                        answer.userVote === "DISLIKE" ? "text-red-500" : "text-muted-foreground"
                      }`}
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </button>
                    {answer.isAccepted && (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-1" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-xs">
                          {answer.user.firstName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {answer.user.firstName} {answer.user.lastName}
                      </span>
                      {(answer.user.role === "MENTOR" ||
                        answer.user.role === "ADMIN") && (
                        <Badge
                          variant="secondary"
                          className="text-xs gap-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                        >
                          <BadgeCheck className="h-3 w-3" />
                          {answer.user.role === "ADMIN" ? "ادمین" : "منتور"}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(answer.createdAt).toLocaleDateString("fa-IR")}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap leading-relaxed text-sm">
                      {answer.content}
                    </p>
                    {/* Accept button for question author */}
                    {user &&
                      question.user.id === user.id &&
                      !answer.isAccepted && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 text-xs gap-1"
                          onClick={() => handleAccept(answer.id)}
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          تایید پاسخ
                        </Button>
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator className="my-6" />

      {/* New Answer Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">پاسخ شما</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitAnswer} className="space-y-4">
            <Textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="پاسخ خود را بنویسید..."
              rows={4}
              required
            />
            <Button type="submit" disabled={submitting} className="gap-2">
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              ارسال پاسخ
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
