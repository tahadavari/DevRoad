import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "احراز هویت لازم است" },
        { status: 401 }
      );
    }

    const roadmapSlug = request.nextUrl.searchParams.get("roadmapSlug");
    const where: { userId: string; roadmapSlug?: string } = { userId: user.id };
    if (roadmapSlug) where.roadmapSlug = roadmapSlug;

    const progress = await prisma.userProgress.findMany({
      where,
      select: { stepId: true, roadmapSlug: true, completedAt: true },
    });

    return NextResponse.json({ success: true, data: progress });
  } catch (error) {
    console.error("Get progress error:", error);
    return NextResponse.json(
      { success: false, error: "خطای سرور" },
      { status: 500 }
    );
  }
}

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
    const { roadmapSlug, stepId, completed } = body;

    if (!roadmapSlug || !stepId) {
      return NextResponse.json(
        { success: false, error: "اطلاعات ناقص" },
        { status: 400 }
      );
    }

    if (completed) {
      await prisma.userProgress.upsert({
        where: {
          userId_roadmapSlug_stepId: {
            userId: user.id,
            roadmapSlug,
            stepId,
          },
        },
        update: { completed: true },
        create: {
          userId: user.id,
          roadmapSlug,
          stepId,
          completed: true,
        },
      });
    } else {
      await prisma.userProgress.deleteMany({
        where: {
          userId: user.id,
          roadmapSlug,
          stepId,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update progress error:", error);
    return NextResponse.json(
      { success: false, error: "خطای سرور" },
      { status: 500 }
    );
  }
}
