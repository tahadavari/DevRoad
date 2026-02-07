"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Map, UserPlus, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("رمز عبور و تکرار آن مطابقت ندارند");
      return;
    }

    if (form.password.length < 8) {
      setError("رمز عبور باید حداقل ۸ کاراکتر باشد");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone || undefined,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "خطا در ثبت‌نام");
        return;
      }

      // Redirect to verification page
      router.push(`/verify?email=${encodeURIComponent(form.email)}`);
    } catch {
      setError("خطا در ارتباط با سرور");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground mb-2">
            <Map className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">ثبت‌نام در دوراه</CardTitle>
          <CardDescription>
            حساب کاربری خود را بسازید و مسیر یادگیری خود را شروع کنید
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">نام *</Label>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={(e) =>
                    setForm({ ...form, firstName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">نام خانوادگی *</Label>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={(e) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">ایمیل *</Label>
              <Input
                id="email"
                type="email"
                dir="ltr"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">شماره تلفن (اختیاری)</Label>
              <Input
                id="phone"
                type="tel"
                dir="ltr"
                placeholder="09123456789"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">رمز عبور *</Label>
              <Input
                id="password"
                type="password"
                dir="ltr"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                required
                minLength={8}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">تکرار رمز عبور *</Label>
              <Input
                id="confirmPassword"
                type="password"
                dir="ltr"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                required
              />
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full gap-2" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              ثبت‌نام
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              قبلاً حساب دارید؟{" "}
              <Link href="/login" className="text-primary hover:underline">
                وارد شوید
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
