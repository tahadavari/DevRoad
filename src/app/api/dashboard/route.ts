import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getRoadmapIndex, getRoadmap, countAllSteps } from "@/lib/roadmap";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "احراز هویت لازم است" },
        { status: 401 }
      );
    }

    // Get user's started roadmaps
    const userRoadmaps = await prisma.userRoadmap.findMany({
      where: { userId: user.id },
    });

    // Get progress for each
    const index = getRoadmapIndex();
    const roadmapData = await Promise.all(
      userRoadmaps.map(async (ur: (typeof userRoadmaps)[number]) => {
        const roadmap = getRoadmap(ur.roadmapSlug);
        const summary = index.roadmaps.find((r) => r.slug === ur.roadmapSlug);
        const progress = await prisma.userProgress.findMany({
          where: { userId: user.id, roadmapSlug: ur.roadmapSlug },
        });

        return {
          roadmapSlug: ur.roadmapSlug,
          title: summary?.title || roadmap?.title || ur.roadmapSlug,
          totalSteps: roadmap ? countAllSteps(roadmap) : summary?.totalSteps || 0,
          completedSteps: progress.length,
          startedAt: ur.startedAt.toISOString(),
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: { roadmaps: roadmapData },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { success: false, error: "خطای سرور" },
      { status: 500 }
    );
  }
}
