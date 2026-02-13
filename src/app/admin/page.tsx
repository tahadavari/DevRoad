"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {
  Shield,
  Users,
  Search,
  Loader2,
  ChevronUp,
  UserCheck,
  Crown,
  MessageCircle,
} from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  emailVerified: boolean;
  createdAt: string;
  _count: {
    userRoadmaps: number;
    forumQuestions: number;
    forumAnswers: number;
  };
}

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== "ADMIN") {
        router.push("/");
        return;
      }
      fetchUsers();
    }
  }, [user, isLoading, router]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success) setUsers(data.data || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const upgradeUser = async (userId: string, newRole: string) => {
    setUpgrading(userId);
    try {
      const res = await fetch("/api/admin/users/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        setUsers(
          users.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch {
      // ignore
    } finally {
      setUpgrading(null);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const filteredUsers = users.filter(
    (u) =>
      u.firstName.includes(search) ||
      u.lastName.includes(search) ||
      u.email.includes(search)
  );

  const roleLabels: Record<string, string> = {
    USER: "کاربر",
    MENTOR: "منتور",
    ADMIN: "ادمین",
  };



  const changeAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordMessage("");

    if (newPassword !== confirmPassword) {
      setPasswordError("تکرار رمز عبور مطابقت ندارد");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("رمز عبور باید حداقل ۸ کاراکتر باشد");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error || "تغییر رمز عبور ناموفق بود");
        return;
      }

      setPasswordMessage("رمز عبور ادمین با موفقیت تغییر کرد");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPasswordError("خطا در ارتباط با سرور");
    } finally {
      setPasswordLoading(false);
    }
  };

  const roleBadgeColors: Record<string, string> = {
    USER: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    MENTOR:
      "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    ADMIN:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">پنل مدیریت</h1>
          <p className="text-muted-foreground text-sm">مدیریت کاربران و نقش‌ها</p>
        </div>
        <Link href="/admin/chat">
          <Button variant="outline" size="sm" className="gap-1">
            <MessageCircle className="h-4 w-4" />
            مشاهده چت‌ها
          </Button>
        </Link>
        <Link href="/admin/forum">
          <Button variant="outline" size="sm">مدیریت فوروم</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <Users className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-xl font-bold">{users.length}</p>
              <p className="text-xs text-muted-foreground">کل کاربران</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <UserCheck className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-xl font-bold">
                {users.filter((u) => u.emailVerified).length}
              </p>
              <p className="text-xs text-muted-foreground">تایید شده</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <Shield className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-xl font-bold">
                {users.filter((u) => u.role === "MENTOR").length}
              </p>
              <p className="text-xs text-muted-foreground">منتور</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <Crown className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-xl font-bold">
                {users.filter((u) => u.role === "ADMIN").length}
              </p>
              <p className="text-xs text-muted-foreground">ادمین</p>
            </div>
          </CardContent>
        </Card>
      </div>



      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">تغییر رمز عبور ادمین</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={changeAdminPassword} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="adminCurrentPassword">رمز فعلی</Label>
              <Input id="adminCurrentPassword" type="password" dir="ltr" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="adminNewPassword">رمز جدید</Label>
              <Input id="adminNewPassword" type="password" dir="ltr" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="adminConfirmPassword">تکرار رمز جدید</Label>
              <Input id="adminConfirmPassword" type="password" dir="ltr" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            <div className="md:col-span-3 flex flex-col gap-2">
              {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
              {passwordMessage && <p className="text-sm text-green-600 dark:text-green-400">{passwordMessage}</p>}
              <Button type="submit" className="w-full md:w-auto" disabled={passwordLoading}>
                {passwordLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "ثبت تغییرات"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="جستجو کاربران..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">کاربران ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                      {u.firstName[0]}
                    </div>
                    <div>
                      <div className="font-medium">
                        {u.firstName} {u.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground" dir="ltr">
                        {u.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-muted-foreground text-center">
                      <p>{u._count.userRoadmaps} مسیر</p>
                      <p>{u._count.forumQuestions + u._count.forumAnswers} فعالیت فوروم</p>
                    </div>
                    <Badge
                      className={roleBadgeColors[u.role]}
                      variant="secondary"
                    >
                      {roleLabels[u.role]}
                    </Badge>
                    {u.role === "USER" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        disabled={upgrading === u.id}
                        onClick={() => upgradeUser(u.id, "MENTOR")}
                      >
                        {upgrading === u.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <ChevronUp className="h-3 w-3" />
                        )}
                        منتور
                      </Button>
                    )}
                    {u.role === "MENTOR" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        disabled={upgrading === u.id}
                        onClick={() => upgradeUser(u.id, "ADMIN")}
                      >
                        {upgrading === u.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <ChevronUp className="h-3 w-3" />
                        )}
                        ادمین
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
