import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createRateLimitKey, enforceRateLimit } from "@/lib/rate-limit";

const PAGE_SIZE = 50;

/** لیست پیام‌های مکالمه با صفحه‌بندی */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "احراز هویت لازم است" },
        { status: 401 }
      );
    }

    const { id: conversationId } = await params;

    const limitResponse = enforceRateLimit(req, {
      key: createRateLimitKey(req, `chat:message:${conversationId}`),
      limit: 40,
      windowMs: 60 * 1000,
    });
    if (limitResponse) return limitResponse;
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor") ?? undefined;
    const limit = Math.min(Number(searchParams.get("limit")) || PAGE_SIZE, 100);

    const conv = await prisma.chatConversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ userId: user.id }, { mentorId: user.id }],
      },
    });
    if (!conv) {
      return NextResponse.json(
        { success: false, error: "مکالمه یافت نشد" },
        { status: 404 }
      );
    }

    const messages = await prisma.chatMessage.findMany({
      where: { conversationId },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true } },
        replyTo: {
          select: { id: true, content: true, type: true, senderId: true, sender: { select: { firstName: true, lastName: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = messages.length > limit;
    const list = (hasMore ? messages.slice(0, limit) : messages).reverse();
    const nextCursor = hasMore ? list[list.length - 1]?.id : null;

    return NextResponse.json({
      success: true,
      data: list,
      nextCursor,
    });
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json(
      { success: false, error: "خطای سرور" },
      { status: 500 }
    );
  }
}

/** ارسال پیام جدید */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "احراز هویت لازم است" },
        { status: 401 }
      );
    }

    const { id: conversationId } = await params;

    const limitResponse = enforceRateLimit(req, {
      key: createRateLimitKey(req, `chat:message:${conversationId}`),
      limit: 40,
      windowMs: 60 * 1000,
    });
    if (limitResponse) return limitResponse;
    const conv = await prisma.chatConversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ userId: user.id }, { mentorId: user.id }],
      },
    });
    if (!conv) {
      return NextResponse.json(
        { success: false, error: "مکالمه یافت نشد" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const type = (body?.type as string) || "TEXT";
    const content = (body?.content as string) ?? "";
    const fileUrl = body?.fileUrl as string | undefined;
    const replyToId = body?.replyToId as string | undefined;

    const validTypes = ["TEXT", "IMAGE", "VOICE", "VIDEO"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: "نوع پیام نامعتبر است" },
        { status: 400 }
      );
    }

    if (type === "TEXT" && !content.trim()) {
      return NextResponse.json(
        { success: false, error: "متن پیام الزامی است" },
        { status: 400 }
      );
    }

    if (replyToId) {
      const replyTo = await prisma.chatMessage.findFirst({
        where: { id: replyToId, conversationId },
      });
      if (!replyTo) {
        return NextResponse.json(
          { success: false, error: "پیام مورد نظر یافت نشد" },
          { status: 400 }
        );
      }
    }

    const message = await prisma.chatMessage.create({
      data: {
        conversationId,
        senderId: user.id,
        type: type as "TEXT" | "IMAGE" | "VOICE" | "VIDEO",
        content: content.trim() || (type === "TEXT" ? "." : "رسانه"),
        fileUrl: fileUrl || null,
        replyToId: replyToId || null,
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true } },
        replyTo: {
          select: { id: true, content: true, type: true, senderId: true, sender: { select: { firstName: true, lastName: true } } },
        },
      },
    });

    await prisma.chatConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ success: true, data: message });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json(
      { success: false, error: "خطای سرور" },
      { status: 500 }
    );
  }
}
