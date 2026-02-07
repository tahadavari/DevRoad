import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const roadmapSlug = request.nextUrl.searchParams.get("roadmapSlug");
    const projectId = request.nextUrl.searchParams.get("projectId");
    const publicOnly = request.nextUrl.searchParams.get("public") === "true";

    const where: Record<string, unknown> = {};
    if (roadmapSlug) where.roadmapSlug = roadmapSlug;
    if (projectId) where.projectId = projectId;
    if (publicOnly) where.isPublic = true;

    const projects = await prisma.project.findMany({
      where,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, role: true },
        },
        feedbacks: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, role: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    console.error("Get projects error:", error);
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
    const { roadmapSlug, projectId, repoUrl, isPublic } = body;

    if (!roadmapSlug || !projectId || !repoUrl) {
      return NextResponse.json(
        { success: false, error: "اطلاعات ناقص" },
        { status: 400 }
      );
    }

    const project = await prisma.project.upsert({
      where: {
        userId_roadmapSlug_projectId: {
          userId: user.id,
          roadmapSlug,
          projectId,
        },
      },
      update: { repoUrl, isPublic: isPublic ?? false },
      create: {
        userId: user.id,
        roadmapSlug,
        projectId,
        repoUrl,
        isPublic: isPublic ?? false,
      },
    });

    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (error) {
    console.error("Submit project error:", error);
    return NextResponse.json(
      { success: false, error: "خطای سرور" },
      { status: 500 }
    );
  }
}
