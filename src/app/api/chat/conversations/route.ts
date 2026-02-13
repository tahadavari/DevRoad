import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/** لیست مکالمات کاربر جاری (user یا mentor) */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "احراز هویت لازم است" },
        { status: 401 }
      );
    }

    const conversations = await prisma.chatConversation.findMany({
      where: {
        OR: [{ userId: user.id }, { mentorId: user.id }],
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        mentor: { select: { id: true, firstName: true, lastName: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const list = conversations.map((c: (typeof conversations)[number]) => {
      const last = c.messages[0];
      const other = c.userId === user.id ? c.mentor : c.user;
      return {
        id: c.id,
        userId: c.userId,
        mentorId: c.mentorId,
        other: { id: other.id, firstName: other.firstName, lastName: other.lastName },
        lastMessage: last
          ? {
              id: last.id,
              content: last.content,
              type: last.type,
              createdAt: last.createdAt,
              sender: last.sender,
            }
          : null,
        updatedAt: c.updatedAt,
      };
    });

    return NextResponse.json({ success: true, data: list });
  } catch (error) {
    console.error("Get conversations error:", error);
    return NextResponse.json(
      { success: false, error: "خطای سرور" },
      { status: 500 }
    );
  }
}

/** ساخت یا برگرداندن مکالمه با یک منتور */
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "احراز هویت لازم است" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const mentorId = body?.mentorId as string | undefined;
    if (!mentorId) {
      return NextResponse.json(
        { success: false, error: "mentorId الزامی است" },
        { status: 400 }
      );
    }

    const mentor = await prisma.user.findFirst({
      where: { id: mentorId, role: { in: ["MENTOR", "ADMIN"] } },
    });
    if (!mentor) {
      return NextResponse.json(
        { success: false, error: "منتور یافت نشد" },
        { status: 404 }
      );
    }

    let conv = await prisma.chatConversation.findUnique({
      where: {
        userId_mentorId: { userId: user.id, mentorId },
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        mentor: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (!conv) {
      conv = await prisma.chatConversation.create({
        data: { userId: user.id, mentorId },
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
          mentor: { select: { id: true, firstName: true, lastName: true } },
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: conv.id,
        userId: conv.userId,
        mentorId: conv.mentorId,
        user: conv.user,
        mentor: conv.mentor,
        createdAt: conv.createdAt,
      },
    });
  } catch (error) {
    console.error("Create conversation error:", error);
    return NextResponse.json(
      { success: false, error: "خطای سرور" },
      { status: 500 }
    );
  }
}
