import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateVerificationCode } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, password } = body;

    // Validation
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

    // Check existing user
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "این ایمیل قبلاً ثبت شده است" },
        { status: 409 }
      );
    }

    // Hash password and create user
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

    // Generate and save verification code
    const code = generateVerificationCode();
    await prisma.verificationCode.create({
      data: {
        email: email.toLowerCase(),
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    // Send email (don't fail if email sending fails)
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
