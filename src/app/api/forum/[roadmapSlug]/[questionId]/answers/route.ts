import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roadmapSlug: string; questionId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "احراز هویت لازم است" },
        { status: 401 }
      );
    }

    const { questionId, roadmapSlug } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { success: false, error: "محتوا الزامی است" },
        { status: 400 }
      );
    }

    const question = await prisma.forumQuestion.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json(
        { success: false, error: "سوال یافت نشد" },
        { status: 404 }
      );
    }

    const answer = await prisma.forumAnswer.create({
      data: {
        questionId,
        userId: user.id,
        content,
        status: "PENDING",
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, role: true },
        },
      },
    });

    if (question.userId !== user.id) {
      await prisma.message.create({
        data: {
          userId: question.userId,
          content: `${user.firstName} ${user.lastName} به سوال شما پاسخ داد`,
          type: "ANSWER_RECEIVED",
          link: `/forum/${roadmapSlug}/${questionId}`,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          ...answer,
          isOwner: true,
          likes: 0,
          dislikes: 0,
          userVote: null,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create answer error:", error);
    return NextResponse.json(
      { success: false, error: "خطای سرور" },
      { status: 500 }
    );
  }
}
