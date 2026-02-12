import type { Metadata } from "next";
import { getAllBlogsMeta } from "@/lib/blog";
import { BlogListClient } from "@/components/blog/blog-list-client";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "بلاگ برنامه‌نویسی",
  description:
    "مطالب آموزشی، نکات حرفه‌ای و تجربه‌های کاربردی برنامه‌نویسی به زبان فارسی در بلاگ DevRoad.",
  path: "/blog",
  keywords: ["بلاگ برنامه نویسی", "آموزش برنامه نویسی", "مقالات برنامه نویسی", "DevRoad blog"],
});

export default function BlogPage() {
  const posts = getAllBlogsMeta();
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">بلاگ DevRoad</h1>
        <p className="mt-2 text-muted-foreground">
          مطالب آموزشی، تجربیات و نکات برنامه‌نویسی
        </p>
      </div>
      <BlogListClient initialPosts={posts} />
    </div>
  );
}
