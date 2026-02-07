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

    const answers = await prisma.forumAnswer.findMany({
      where: { questionId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, role: true },
        },
        votes: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Process answers to add vote counts
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
        user: answer.user,
        likes,
        dislikes,
        userVote,
      };
    });

    return NextResponse.json({
      success: true,
      data: { question, answers: processedAnswers },
    });
  } catch (error) {
    console.error("Get question error:", error);
    return NextResponse.json(
      { success: false, error: "خطای سرور" },
      { status: 500 }
    );
  }
}
