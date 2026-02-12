import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const user = await getCurrentUser();

    const comments = await prisma.blogComment.findMany({
      where: {
        blogSlug: slug,
        OR: user
          ? [{ status: "APPROVED" }, { userId: user.id }]
          : [{ status: "APPROVED" }],
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    const data = comments.map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt,
      status: c.status,
      isOwner: user ? c.userId === user.id : false,
      user: c.user,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Blog comments list error:", error);
    return NextResponse.json(
      { success: false, error: "خطای سرور" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
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
    const body = await request.json();
    const content = typeof body.content === "string" ? body.content.trim() : "";

    if (!content) {
      return NextResponse.json(
        { success: false, error: "متن نظر الزامی است" },
        { status: 400 }
      );
    }

    const comment = await prisma.blogComment.create({
      data: {
        blogSlug: slug,
        userId: user.id,
        content,
        status: "PENDING",
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        status: comment.status,
        isOwner: true,
        user: comment.user,
      },
    });
  } catch (error) {
    console.error("Blog comment create error:", error);
    return NextResponse.json(
      { success: false, error: "خطای سرور" },
      { status: 500 }
    );
  }
}
