import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ roadmapSlug: string; questionId: string }> }
) {
  try {
    const { questionId } = await params;
    const user = await getCurrentUser();

    const question = await prisma.forumQuestion.findUnique({
      where: { id: questionId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, role: true },
        },
      },
    });

    if (!question) {
      return NextResponse.json(
        { success: false, error: "سوال یافت نشد" },
        { status: 404 }
      );
    }

    const canViewQuestion =
      question.status === "APPROVED" ||
      (user && (user.role === "ADMIN" || question.userId === user.id));

    if (!canViewQuestion) {
      return NextResponse.json(
        { success: false, error: "سوال یافت نشد" },
        { status: 404 }
      );
    }

    const answers = await prisma.forumAnswer.findMany({
      where: {
        questionId,
        OR:
          user?.role === "ADMIN"
            ? undefined
            : user
            ? [{ status: "APPROVED" }, { userId: user.id }]
            : [{ status: "APPROVED" }],
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, role: true },
        },
        votes: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const processedAnswers = answers.map((answer) => {
      const likes = answer.votes.filter((v) => v.type === "LIKE").length;
      const dislikes = answer.votes.filter((v) => v.type === "DISLIKE").length;
      const userVote = user
        ? answer.votes.find((v) => v.userId === user.id)?.type || null
        : null;

      return {
        id: answer.id,
        content: answer.content,
        isAccepted: answer.isAccepted,
        createdAt: answer.createdAt,
        status: answer.status,
        isOwner: user ? answer.userId === user.id : false,
        user: answer.user,
        likes,
        dislikes,
        userVote,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        question: {
          ...question,
          isOwner: user ? question.userId === user.id : false,
        },
        answers: processedAnswers,
      },
    });
  } catch (error) {
    console.error("Get question error:", error);
    return NextResponse.json(
      { success: false, error: "خطای سرور" },
      { status: 500 }
    );
  }
}
