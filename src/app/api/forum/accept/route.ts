import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "احراز هویت لازم است" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { answerId } = body;

    if (!answerId) {
      return NextResponse.json(
        { success: false, error: "اطلاعات ناقص" },
        { status: 400 }
      );
    }

    // Get answer and check question ownership
    const answer = await prisma.forumAnswer.findUnique({
      where: { id: answerId },
      include: { question: true },
    });

    if (!answer) {
      return NextResponse.json(
        { success: false, error: "پاسخ یافت نشد" },
        { status: 404 }
      );
    }

    if (answer.question.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: "فقط نویسنده سوال می‌تواند پاسخ را تایید کند" },
        { status: 403 }
      );
    }

    // Unaccept all other answers for this question
    await prisma.forumAnswer.updateMany({
      where: { questionId: answer.questionId },
      data: { isAccepted: false },
    });

    // Accept this answer
    await prisma.forumAnswer.update({
      where: { id: answerId },
      data: { isAccepted: true },
    });

    // Notify the answer author
    if (answer.userId !== user.id) {
      await prisma.message.create({
        data: {
          userId: answer.userId,
          content: `پاسخ شما توسط نویسنده سوال تایید شد!`,
          type: "ANSWER_ACCEPTED",
          link: `/forum`,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Accept answer error:", error);
    return NextResponse.json(
      { success: false, error: "خطای سرور" },
      { status: 500 }
    );
  }
}
