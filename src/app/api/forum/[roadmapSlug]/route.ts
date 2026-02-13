import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ roadmapSlug: string }> }
) {
  try {
    const { roadmapSlug } = await params;
    const user = await getCurrentUser();

    const forum = await prisma.forum.findUnique({
      where: { roadmapSlug },
    });

    if (!forum) {
      return NextResponse.json({ success: true, data: [] });
    }

    const questions = await prisma.forumQuestion.findMany({
      where: {
        forumId: forum.id,
        OR:
          user?.role === "ADMIN"
            ? undefined
            : user
            ? [{ status: "APPROVED" }, { userId: user.id }]
            : [{ status: "APPROVED" }],
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, role: true },
        },
        _count: { select: { answers: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = questions.map((q: (typeof questions)[number]) => ({
      ...q,
      isOwner: user ? q.userId === user.id : false,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Get forum questions error:", error);
    return NextResponse.json(
      { success: false, error: "خطای سرور" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roadmapSlug: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "احراز هویت لازم است" },
        { status: 401 }
      );
    }

    const { roadmapSlug } = await params;
    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: "عنوان و محتوا الزامی است" },
        { status: 400 }
      );
    }

    let forum = await prisma.forum.findUnique({
      where: { roadmapSlug },
    });

    if (!forum) {
      forum = await prisma.forum.create({
        data: { roadmapSlug, title: `فوروم ${roadmapSlug}` },
      });
    }

    const question = await prisma.forumQuestion.create({
      data: {
        forumId: forum.id,
        userId: user.id,
        title,
        content,
        status: "PENDING",
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, role: true },
        },
        _count: { select: { answers: true } },
      },
    });

    return NextResponse.json(
      { success: true, data: { ...question, isOwner: true } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create question error:", error);
    return NextResponse.json(
      { success: false, error: "خطای سرور" },
      { status: 500 }
    );
  }
}
