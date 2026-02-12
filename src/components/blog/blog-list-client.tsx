"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BlogMeta } from "@/lib/blog";
import { Search, Clock, Mail, FileText, Tag } from "lucide-react";

export function BlogListClient({ initialPosts }: { initialPosts: BlogMeta[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return initialPosts;
    const q = query.trim().toLowerCase();
    return initialPosts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q) ||
        p.authorEmail.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [initialPosts, query]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="جستجو در عنوان، توضیحات، نویسنده، تگ یا slug..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pr-10 pl-4"
        />
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <FileText className="h-4 w-4" />
        <span>{filtered.length} مطلب</span>
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          مطلبی یافت نشد.
        </p>
      ) : (
        <ul className="space-y-4">
          {filtered.map((post) => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`}>
                <Card className="overflow-hidden transition hover:border-primary/50">
                  <div className="flex flex-col sm:flex-row">
                    {post.thumbnail && (
                      <div className="relative h-40 w-full shrink-0 sm:h-36 sm:w-48">
                        <Image
                          src={
                            post.thumbnail.startsWith("/")
                              ? post.thumbnail
                              : `/blog-assets/${post.slug}/images/${post.thumbnail.replace(/^images\//, "")}`
                          }
                          alt=""
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 192px"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <CardHeader className="pb-2">
                        <h2 className="text-lg font-semibold">{post.title}</h2>
                        {post.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {post.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <Badge variant="secondary" className="gap-1 text-xs">
                            <Clock className="h-3 w-3" />
                            {post.readingTimeMinutes} دقیقه
                          </Badge>
                          {post.authorEmail && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {post.authorEmail}
                            </span>
                          )}
                          {post.date && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(post.date).toLocaleDateString("fa-IR")}
                            </span>
                          )}
                          {post.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="gap-1 text-xs">
                              <Tag className="h-3 w-3" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardHeader>
                    </div>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="pt-4">
        <Link
          href="/blog/blog-writing-guide"
          className="text-sm text-primary hover:underline"
        >
          راهنمای نوشتن بلاگ در DevRoad
        </Link>
      </div>
    </div>
  );
}
