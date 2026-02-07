import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: "ایمیل و کد تایید الزامی است" },
        { status: 400 }
      );
    }

    // Find the latest valid verification code
    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        email: email.toLowerCase(),
        code,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!verificationCode) {
      return NextResponse.json(
        { success: false, error: "کد تایید نامعتبر یا منقضی شده است" },
        { status: 400 }
      );
    }

    // Update user
    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { emailVerified: true },
    });

    // Delete used codes
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
