import { NextRequest, NextResponse } from "next/server";

type JwtPayload = {
  role?: "USER" | "MENTOR" | "ADMIN";
};

function parseTokenRole(token: string | undefined): JwtPayload["role"] {
  if (!token) return undefined;

  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return undefined;

    const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const json = JSON.parse(atob(padded)) as JwtPayload;
    return json.role;
  } catch {
    return undefined;
  }
}

function shouldNoIndex(pathname: string) {
  return ["/admin", "/dashboard", "/chat", "/messages", "/login", "/register", "/verify"].some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = parseTokenRole(request.cookies.get("devroad_token")?.value);

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (role !== "ADMIN") {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json(
          { success: false, error: "دسترسی مجاز نیست" },
          { status: 403 }
        );
      }

      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  const response = NextResponse.next();

  if (shouldNoIndex(pathname)) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/dashboard/:path*", "/chat/:path*", "/messages/:path*", "/login", "/register", "/verify"],
};
