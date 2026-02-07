import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getBlogSlugs,
  getBlogBySlug,
  resolveBlogContentImagePaths,
} from "@/lib/blog";
import { compileMDX } from "next-mdx-remote/rsc";
import { BlogRef } from "@/components/blog/mdx-components";
import { BlogPostActions } from "@/components/blog/blog-post-actions";
import { BlogComments } from "@/components/blog/blog-comments";
import { Clock, Mail } from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = getBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogBySlug(slug);
  if (!post) return { title: "بلاگ" };
  return {
    title: post.title,
    description: post.description ?? undefined,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogBySlug(slug);
  if (!post) notFound();

  const contentForMdx = resolveBlogContentImagePaths(post.content, slug);
  const { content } = await compileMDX({
    source: contentForMdx,
    components: { BlogRef },
  });

  return (
    <article
      className="container mx-auto max-w-3xl px-4 py-8"
      style={{ fontFamily: "var(--font-sans)" }}
      dir="rtl"
    >
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{post.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {post.readingTimeMinutes} دقیقه مطالعه
          </span>
          {post.authorEmail && (
            <span className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              {post.authorEmail}
            </span>
          )}
          {post.date && (
            <span>{new Date(post.date).toLocaleDateString("fa-IR")}</span>
          )}
        </div>
        <BlogPostActions blogSlug={slug} />
      </header>

      <div className="blog-prose prose prose-neutral dark:prose-invert max-w-none [&_img]:rounded-lg">
        {content}
      </div>

      <footer className="mt-12 border-t pt-8">
        <BlogComments blogSlug={slug} />
      </footer>
    </article>
  );
}
