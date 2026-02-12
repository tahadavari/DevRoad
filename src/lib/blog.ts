import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export interface BlogFrontmatter {
  title: string;
  slug: string;
  authorEmail: string;
  thumbnail?: string;
  date?: string;
  description?: string;
  tags?: string[];
}

export interface BlogMeta {
  slug: string;
  title: string;
  authorEmail: string;
  thumbnail?: string;
  date: string;
  description?: string;
  tags: string[];
  readingTimeMinutes: number;
}

export interface BlogPost extends BlogMeta {
  content: string;
  rawContent: string;
}

function getBlogDir(): string {
  if (!fs.existsSync(BLOG_DIR)) return BLOG_DIR;
  return BLOG_DIR;
}

export function getBlogSlugs(): string[] {
  const dir = getBlogDir();
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const slugs: string[] = [];
  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    const mdxPath = path.join(dir, ent.name, "index.mdx");
    if (fs.existsSync(mdxPath)) slugs.push(ent.name);
  }
  return slugs.sort();
}

export function getBlogBySlug(slug: string): BlogPost | null {
  const mdxPath = path.join(getBlogDir(), slug, "index.mdx");
  if (!fs.existsSync(mdxPath)) return null;
  const raw = fs.readFileSync(mdxPath, "utf-8");
  const { data, content } = matter(raw);
  const front = data as Partial<BlogFrontmatter>;
  const title = front.title ?? slug;
  const date = front.date ?? "";
  const tags = Array.isArray(front.tags) ? front.tags.filter(Boolean) : [];
  const stats = readingTime(content);
  const readingTimeMinutes = Math.max(1, Math.ceil(stats.minutes));
  return {
    slug,
    title,
    authorEmail: front.authorEmail ?? "",
    thumbnail: front.thumbnail,
    date,
    description: front.description,
    tags,
    readingTimeMinutes,
    content,
    rawContent: raw,
  };
}

export function getAllBlogsMeta(): BlogMeta[] {
  const slugs = getBlogSlugs();
  const list: BlogMeta[] = [];
  for (const slug of slugs) {
    const post = getBlogBySlug(slug);
    if (!post) continue;
    list.push({
      slug: post.slug,
      title: post.title,
      authorEmail: post.authorEmail,
      thumbnail: post.thumbnail,
      date: post.date,
      description: post.description,
      tags: post.tags,
      readingTimeMinutes: post.readingTimeMinutes,
    });
  }
  return list.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}

export function getBlogImagePath(blogSlug: string, imageName: string): string {
  return `/blog-assets/${blogSlug}/images/${imageName}`;
}

export function resolveBlogContentImagePaths(content: string, blogSlug: string): string {
  return content.replace(
    /\]\(\.\/images\//g,
    `](/blog-assets/${blogSlug}/images/`
  );
}
