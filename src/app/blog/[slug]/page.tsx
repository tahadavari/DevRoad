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
import { getAbsoluteUrl, siteConfig } from "@/lib/seo";
import { Clock, Mail, Tag } from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = getBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogBySlug(slug);
  if (!post) return { title: "بلاگ" };

  const canonical = getAbsoluteUrl(`/blog/${slug}`);
  const description =
    post.description ?? `مقاله «${post.title}» را در بلاگ DevRoad بخوانید.`;

  return {
    title: post.title,
    description,
    keywords: [...post.tags, post.title, "بلاگ برنامه نویسی"],
    alternates: {
      canonical,
    },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url: canonical,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      publishedTime: post.date || undefined,
      tags: post.tags,
      images: [
        {
          url: getAbsoluteUrl("/og-image.svg"),
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [getAbsoluteUrl("/og-image.svg")],
    },
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

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description:
      post.description ?? `مقاله ${post.title} در بلاگ DevRoad`,
    datePublished: post.date || undefined,
    author: {
      "@type": "Person",
      name: post.authorEmail || "DevRoad",
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: getAbsoluteUrl("/icon.svg"),
      },
    },
    mainEntityOfPage: getAbsoluteUrl(`/blog/${slug}`),
  };

  return (
    <article
      className="container mx-auto max-w-3xl px-4 py-8"
      style={{ fontFamily: "var(--font-sans)" }}
      dir="rtl"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
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
        {post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs text-muted-foreground"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        )}
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
