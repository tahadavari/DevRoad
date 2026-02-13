"use client";

import { useState } from "react";
import Link from "next/link";
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
import { KeyRound, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const sendCode = async () => {
    setError("");
    setSuccess("");
    setIsSending(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "ارسال کد با خطا مواجه شد");
        return;
      }

      setSent(true);
      setSuccess("اگر ایمیل معتبر باشد، کد بازیابی ارسال می‌شود.");
    } catch {
      setError("خطا در ارتباط با سرور");
    } finally {
      setIsSending(false);
    }
  };

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("تکرار رمز عبور مطابقت ندارد");
      return;
    }

    if (newPassword.length < 8) {
      setError("رمز عبور باید حداقل ۸ کاراکتر باشد");
      return;
    }

    setIsResetting(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "بازنشانی رمز با خطا مواجه شد");
        return;
      }

      setSuccess("رمز عبور با موفقیت تغییر کرد. حالا می‌توانید وارد شوید.");
      setCode("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setError("خطا در ارتباط با سرور");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2">
            <KeyRound className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">فراموشی رمز عبور</CardTitle>
          <CardDescription>برای بازیابی رمز، کد تایید ایمیل دریافت کنید</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={resetPassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">ایمیل</Label>
              <Input
                id="email"
                type="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={sendCode}
              disabled={isSending || !email}
            >
              {isSending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> در حال ارسال...</>
              ) : (
                sent ? "ارسال مجدد کد" : "ارسال کد بازیابی"
              )}
            </Button>

            <div className="space-y-1.5">
              <Label htmlFor="code">کد ۶ رقمی</Label>
              <Input
                id="code"
                dir="ltr"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="newPassword">رمز عبور جدید</Label>
              <Input
                id="newPassword"
                type="password"
                dir="ltr"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">تکرار رمز عبور جدید</Label>
              <Input
                id="confirmPassword"
                type="password"
                dir="ltr"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}
            {success && <div className="text-sm text-green-700 bg-green-100 dark:bg-green-900/40 p-3 rounded-md">{success}</div>}

            <Button type="submit" className="w-full" disabled={isResetting || code.length !== 6}>
              {isResetting ? <Loader2 className="h-4 w-4 animate-spin" /> : "تغییر رمز عبور"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              <Link href="/login" className="text-primary hover:underline">بازگشت به ورود</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
