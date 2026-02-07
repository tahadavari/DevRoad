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
    const { roadmapSlug } = body;

    if (!roadmapSlug) {
      return NextResponse.json(
        { success: false, error: "مسیر مشخص نشده" },
        { status: 400 }
      );
    }

    await prisma.userRoadmap.upsert({
      where: {
        userId_roadmapSlug: {
          userId: user.id,
          roadmapSlug,
        },
      },
      update: {},
      create: {
        userId: user.id,
        roadmapSlug,
      },
    });

    return NextResponse.json({
      success: true,
      message: "مسیر با موفقیت شروع شد",
    });
  } catch (error) {
    console.error("Start roadmap error:", error);
    return NextResponse.json(
      { success: false, error: "خطای سرور" },
      { status: 500 }
    );
  }
}
