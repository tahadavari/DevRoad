import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createRateLimitKey, enforceRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const limitResponse = enforceRateLimit(request, {
      key: createRateLimitKey(request, "auth:verify"),
      limit: 10,
      windowMs: 10 * 60 * 1000,
    });
    if (limitResponse) return limitResponse;

    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: "ایمیل و کد تایید الزامی است" },
        { status: 400 }
      );
    }

    const isDevBypass =
      process.env.NODE_ENV === "development" && code === "123456";

    let verificationCode: { email: string } | null = null;

    if (isDevBypass) {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
      if (user) verificationCode = { email: user.email };
    } else {
      verificationCode = await prisma.verificationCode.findFirst({
        where: {
          email: email.toLowerCase(),
          code,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    if (!verificationCode) {
      return NextResponse.json(
        { success: false, error: "کد تایید نامعتبر یا منقضی شده است" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { emailVerified: true },
    });

    await prisma.verificationCode.deleteMany({
      where: { email: email.toLowerCase() },
    });

    return NextResponse.json({
      success: true,
      message: "ایمیل با موفقیت تایید شد",
    });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json(
      { success: false, error: "خطای سرور" },
      { status: 500 }
    );
  }
}
