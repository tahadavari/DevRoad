import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "دسترسی مجاز نیست" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { commentId, status } = body;

    if (!commentId || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "اطلاعات نامعتبر" },
        { status: 400 }
      );
    }

    await prisma.blogComment.update({
      where: { id: commentId },
      data: { status },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin update blog comment status error:", error);
    return NextResponse.json(
      { success: false, error: "خطای سرور" },
      { status: 500 }
    );
  }
}
