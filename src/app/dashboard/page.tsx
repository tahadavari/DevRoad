"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Map,
  ArrowLeft,
  FolderKanban,
  MessageSquare,
  CheckCircle2,
  Loader2,
  User,
  Bookmark,
} from "lucide-react";

interface RoadmapProgress {
  roadmapSlug: string;
  title: string;
  totalSteps: number;
  completedSteps: number;
  startedAt: string;
}

interface BlogBookmarkItem {
  blogSlug: string;
  title: string;
  readingTimeMinutes?: number;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const [roadmaps, setRoadmaps] = useState<RoadmapProgress[]>([]);
  const [bookmarks, setBookmarks] = useState<BlogBookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      Promise.all([
        fetch("/api/dashboard").then((res) => res.json()),
        fetch("/api/blog/bookmarks").then((res) => res.json()),
      ])
        .then(([dashboardData, bookmarksData]) => {
          if (dashboardData.success) {
            setRoadmaps(dashboardData.data.roadmaps || []);
          }
          if (bookmarksData.success && Array.isArray(bookmarksData.data)) {
            setBookmarks(bookmarksData.data);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Welcome */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              سلام {user.firstName} {user.lastName}!
            </h1>
            <p className="text-muted-foreground text-sm">
              خوش آمدید به داشبورد شما
            </p>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Badge variant="secondary">
            {user.role === "ADMIN"
              ? "ادمین"
              : user.role === "MENTOR"
              ? "منتور"
              : "کاربر"}
          </Badge>
          <Badge variant="outline">{user.email}</Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600">
              <Map className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{roadmaps.length}</p>
              <p className="text-sm text-muted-foreground">مسیر شروع شده</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {roadmaps.reduce((sum, r) => sum + r.completedSteps, 0)}
              </p>
              <p className="text-sm text-muted-foreground">مرحله تکمیل شده</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900 text-purple-600">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {roadmaps.reduce(
                  (sum, r) =>
                    sum +
                    (r.totalSteps > 0
                      ? Math.round((r.completedSteps / r.totalSteps) * 100)
                      : 0),
                  0
                ) / Math.max(roadmaps.length, 1)}
                %
              </p>
              <p className="text-sm text-muted-foreground">میانگین پیشرفت</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookmarked Blogs */}
      {bookmarks.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">بوک‌مارک‌های بلاگ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookmarks.map((b) => (
              <Link key={b.blogSlug} href={`/blog/${b.blogSlug}`}>
                <Card className="h-full transition hover:border-primary/50">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900 text-amber-600">
                      <Bookmark className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{b.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {b.readingTimeMinutes ? `${b.readingTimeMinutes} دقیقه` : ""}
                      </p>
                    </div>
                    <ArrowLeft className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <Link href="/blog" className="text-sm text-primary hover:underline mt-2 inline-block">
            همه بلاگ‌ها
          </Link>
        </div>
      )}

      {/* Active Roadmaps */}
      <div>
        <h2 className="text-xl font-bold mb-4">مسیرهای فعال</h2>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : roadmaps.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Map className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">هنوز مسیری شروع نکرده‌اید</h3>
              <p className="text-muted-foreground mb-4">
                از صفحه مسیرها یکی را انتخاب و شروع کنید
              </p>
              <Link href="/roadmaps">
                <Button className="gap-2">
                  <Map className="h-4 w-4" />
                  مشاهده مسیرها
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roadmaps.map((rm) => {
              const percent =
                rm.totalSteps > 0
                  ? Math.round((rm.completedSteps / rm.totalSteps) * 100)
                  : 0;
              return (
                <Card key={rm.roadmapSlug}>
                  <CardHeader>
                    <CardTitle className="text-lg">{rm.title}</CardTitle>
                    <CardDescription>
                      {rm.completedSteps} از {rm.totalSteps} مرحله تکمیل شده
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress value={percent} className="mb-4" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{percent}%</span>
                      <div className="flex gap-2">
                        <Link href={`/forum/${rm.roadmapSlug}`}>
                          <Button variant="ghost" size="sm" className="gap-1">
                            <MessageSquare className="h-3 w-3" />
                            فوروم
                          </Button>
                        </Link>
                        <Link href={`/roadmaps/${rm.roadmapSlug}`}>
                          <Button variant="outline" size="sm" className="gap-1">
                            ادامه
                            <ArrowLeft className="h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
