"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Mail, Loader2, CheckCircle2 } from "lucide-react";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "کد تایید نامعتبر است");
        return;
      }

      router.push("/login?verified=true");
    } catch {
      setError("خطا در ارتباط با سرور");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      // Ignore
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 mb-2">
            <Mail className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">تایید ایمیل</CardTitle>
          <CardDescription>
            یک کد تایید به ایمیل{" "}
            <span dir="ltr" className="font-medium text-foreground">
              {email}
            </span>{" "}
            ارسال شد
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="code">کد تایید ۶ رقمی</Label>
              <Input
                id="code"
                dir="ltr"
                className="text-center text-2xl tracking-[0.5em]"
                maxLength={6}
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                required
              />
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full gap-2"
              disabled={isLoading || code.length !== 6}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              تایید
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              کد دریافت نکردید؟{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-primary hover:underline"
              >
                {resending ? "در حال ارسال..." : "ارسال مجدد"}
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <VerifyForm />
    </Suspense>
  );
}
