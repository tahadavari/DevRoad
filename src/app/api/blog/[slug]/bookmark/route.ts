import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "احراز هویت لازم است" },
        { status: 401 }
      );
    }

    const { slug } = await params;

    const existing = await prisma.blogBookmark.findUnique({
      where: {
        userId_blogSlug: { userId: user.id, blogSlug: slug },
      },
    });

    if (existing) {
      await prisma.blogBookmark.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({
        success: true,
        data: { bookmarked: false },
      });
    }

    await prisma.blogBookmark.create({
      data: {
        userId: user.id,
        blogSlug: slug,
      },
    });

    return NextResponse.json({
      success: true,
      data: { bookmarked: true },
    });
  } catch (error) {
    console.error("Blog bookmark toggle error:", error);
    return NextResponse.json(
      { success: false, error: "خطای سرور" },
      { status: 500 }
    );
  }
}
