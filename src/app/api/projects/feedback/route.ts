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
    const { projectId, content } = body;

    if (!projectId || !content) {
      return NextResponse.json(
        { success: false, error: "اطلاعات ناقص" },
        { status: 400 }
      );
    }

    // Check project exists and is public (or belongs to user or user is mentor/admin)
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: "پروژه یافت نشد" },
        { status: 404 }
      );
    }

    if (
      !project.isPublic &&
      project.userId !== user.id &&
      user.role === "USER"
    ) {
      return NextResponse.json(
        { success: false, error: "دسترسی مجاز نیست" },
        { status: 403 }
      );
    }

    const feedback = await prisma.projectFeedback.create({
      data: {
        projectId,
        userId: user.id,
        content,
      },
    });

    return NextResponse.json(
      { success: true, data: feedback },
      { status: 201 }
    );
  } catch (error) {
    console.error("Project feedback error:", error);
    return NextResponse.json(
      { success: false, error: "خطای سرور" },
      { status: 500 }
    );
  }
}
