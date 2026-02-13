import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "دسترسی مجاز نیست" },
        { status: 403 }
      );
    }

    const questions = await prisma.forumQuestion.findMany({
      include: {
        forum: { select: { roadmapSlug: true } },
        user: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    const pendingQuestions = questions.filter(
      (question: (typeof questions)[number]) => question.status === "PENDING"
    );

    return NextResponse.json({ success: true, data: pendingQuestions });
  } catch (error) {
    console.error("Admin pending questions error:", error);
    return NextResponse.json(
      { success: false, error: "خطای سرور" },
      { status: 500 }
    );
  }
}
