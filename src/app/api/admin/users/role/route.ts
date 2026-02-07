import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "دسترسی مجاز نیست" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !["USER", "MENTOR", "ADMIN"].includes(role)) {
      return NextResponse.json(
        { success: false, error: "اطلاعات نامعتبر" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    // Send notification to user
    const roleLabels: Record<string, string> = {
      MENTOR: "منتور",
      ADMIN: "ادمین",
    };

    if (role !== "USER") {
      await prisma.message.create({
        data: {
          userId,
          content: `تبریک! نقش شما به ${roleLabels[role] || role} ارتقا یافت`,
          type: "ROLE_UPGRADED",
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update role error:", error);
    return NextResponse.json(
      { success: false, error: "خطای سرور" },
      { status: 500 }
    );
  }
}
