import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateVerificationCode } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import { createRateLimitKey, enforceRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const limitResponse = enforceRateLimit(request, {
      key: createRateLimitKey(request, "auth:register"),
      limit: 5,
      windowMs: 10 * 60 * 1000,
    });
    if (limitResponse) return limitResponse;

    const body = await request.json();
    const { firstName, lastName, email, phone, password } = body;

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { success: false, error: "تمام فیلدهای الزامی را پر کنید" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "رمز عبور باید حداقل ۸ کاراکتر باشد" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "این ایمیل قبلاً ثبت شده است" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: email.toLowerCase(),
        phone: phone || null,
        password: hashedPassword,
      },
    });

    const code = generateVerificationCode();
    await prisma.verificationCode.create({
      data: {
        email: email.toLowerCase(),
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    try {
      await sendVerificationEmail(email.toLowerCase(), code);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "ثبت‌نام با موفقیت انجام شد. کد تایید به ایمیل شما ارسال شد.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, error: "خطای سرور" },
      { status: 500 }
    );
  }
}
