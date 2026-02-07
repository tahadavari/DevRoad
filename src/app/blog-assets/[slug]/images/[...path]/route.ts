import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; path: string[] }> }
) {
  const { slug, path: pathSegments } = await params;
  if (!slug || !pathSegments?.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const safeSlug = slug.replace(/\.\./g, "");
  const safePath = pathSegments.map((p) => p.replace(/\.\./g, "")).join(path.sep);
  const filePath = path.join(BLOG_DIR, safeSlug, "images", safePath);
  if (!filePath.startsWith(path.join(BLOG_DIR, safeSlug))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const types: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
  };
  const contentType = types[ext] ?? "application/octet-stream";
  return new NextResponse(buffer, {
    headers: { "Content-Type": contentType },
  });
}
