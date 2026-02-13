import { NextResponse } from "next/server";

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

type StoreEntry = {
  count: number;
  resetAt: number;
};

const globalForRateLimit = globalThis as typeof globalThis & {
  __devroadRateLimitStore?: Map<string, StoreEntry>;
};

const store =
  globalForRateLimit.__devroadRateLimitStore ??
  (globalForRateLimit.__devroadRateLimitStore = new Map<string, StoreEntry>());

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") || "unknown";
}

export function createRateLimitKey(request: Request, scope: string): string {
  return `${scope}:${getClientIp(request)}`;
}

export function enforceRateLimit(
  request: Request,
  options: RateLimitOptions
): NextResponse | null {
  const now = Date.now();
  const existing = store.get(options.key);

  if (!existing || existing.resetAt <= now) {
    store.set(options.key, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    return null;
  }

  if (existing.count >= options.limit) {
    const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return NextResponse.json(
      {
        success: false,
        error: "تعداد درخواست‌ها بیش از حد مجاز است. لطفاً کمی بعد دوباره تلاش کنید.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": retryAfter.toString(),
        },
      }
    );
  }

  existing.count += 1;
  store.set(options.key, existing);
  return null;
}

