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
    const { answerId, type } = body;

    if (!answerId || !["LIKE", "DISLIKE"].includes(type)) {
      return NextResponse.json(
        { success: false, error: "اطلاعات نامعتبر" },
        { status: 400 }
      );
    }

    const answer = await prisma.forumAnswer.findUnique({
      where: { id: answerId },
      select: { id: true, status: true, userId: true },
    });

    if (!answer || (answer.status !== "APPROVED" && user.role !== "ADMIN" && answer.userId !== user.id)) {
      return NextResponse.json(
        { success: false, error: "پاسخ قابل رای‌دهی نیست" },
        { status: 404 }
      );
    }

    // Check existing vote
    const existingVote = await prisma.answerVote.findUnique({
      where: {
        answerId_userId: {
          answerId,
          userId: user.id,
        },
      },
    });

    if (existingVote) {
      if (existingVote.type === type) {
        // Remove vote (toggle)
        await prisma.answerVote.delete({
          where: { id: existingVote.id },
        });
      } else {
        // Change vote type
        await prisma.answerVote.update({
          where: { id: existingVote.id },
          data: { type },
        });
      }
    } else {
      // Create new vote
      await prisma.answerVote.create({
        data: {
          answerId,
          userId: user.id,
          type,
        },
      });
    }

    // Get updated counts
    const likes = await prisma.answerVote.count({
      where: { answerId, type: "LIKE" },
    });
    const dislikes = await prisma.answerVote.count({
      where: { answerId, type: "DISLIKE" },
    });
    const userVote = await prisma.answerVote.findUnique({
      where: { answerId_userId: { answerId, userId: user.id } },
    });

    return NextResponse.json({
      success: true,
      data: {
        likes,
        dislikes,
        userVote: userVote?.type || null,
      },
    });
  } catch (error) {
    console.error("Vote error:", error);
    return NextResponse.json(
      { success: false, error: "خطای سرور" },
      { status: 500 }
    );
  }
}
