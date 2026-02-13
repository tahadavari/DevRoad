import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getAllBlogsMeta } from "@/lib/blog";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "احراز هویت لازم است" },
        { status: 401 }
      );
    }

    const bookmarks = await prisma.blogBookmark.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    const allMeta = getAllBlogsMeta();
    const metaBySlug = Object.fromEntries(allMeta.map((m: (typeof allMeta)[number]) => [m.slug, m]));

    const data = bookmarks
      .map((b: (typeof bookmarks)[number]) => ({
        blogSlug: b.blogSlug,
        createdAt: b.createdAt,
        ...metaBySlug[b.blogSlug],
      }))
      .filter(
        (x: { blogSlug: string; createdAt: Date; title?: string }) =>
          Boolean(x.title)
      );

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Blog bookmarks list error:", error);
    return NextResponse.json(
      { success: false, error: "خطای سرور" },
      { status: 500 }
    );
  }
}
