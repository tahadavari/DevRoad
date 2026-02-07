import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateVerificationCode } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "ایمیل الزامی است" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || user.emailVerified) {
      // Don't reveal user existence
      return NextResponse.json({
        success: true,
        message: "اگر ایمیل معتبر باشد، کد تایید ارسال خواهد شد",
      });
    }

    // Delete old codes
    await prisma.verificationCode.deleteMany({
      where: { email: email.toLowerCase() },
    });

    // Generate new code
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

    return NextResponse.json({
      success: true,
      message: "کد تایید جدید ارسال شد",
    });
  } catch (error) {
    console.error("Resend code error:", error);
    return NextResponse.json(
      { success: false, error: "خطای سرور" },
      { status: 500 }
    );
  }
}
