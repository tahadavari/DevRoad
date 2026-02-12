import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/** ادمین: لیست همه مکالمات */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 403 }
      );
    }

    const conversations = await prisma.chatConversation.findMany({
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        mentor: { select: { id: true, firstName: true, lastName: true, email: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { id: true, content: true, type: true, createdAt: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const list = conversations.map((c) => ({
      id: c.id,
      userId: c.userId,
      mentorId: c.mentorId,
      user: c.user,
      mentor: c.mentor,
      lastMessage: c.messages[0] ?? null,
      updatedAt: c.updatedAt,
    }));

    return NextResponse.json({ success: true, data: list });
  } catch (error) {
    console.error("Admin get conversations error:", error);
    return NextResponse.json(
      { success: false, error: "خطای سرور" },
      { status: 500 }
    );
  }
}
