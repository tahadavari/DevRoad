import type { Metadata } from "next";
import { getAllBlogsMeta } from "@/lib/blog";
import { BlogListClient } from "@/components/blog/blog-list-client";

export const metadata: Metadata = {
  title: "بلاگ دوراه",
  description: "مطالب آموزشی و تجربیات برنامه‌نویسی به زبان فارسی",
};

export default function BlogPage() {
  const posts = getAllBlogsMeta();
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">بلاگ دوراه</h1>
        <p className="mt-2 text-muted-foreground">
          مطالب آموزشی، تجربیات و نکات برنامه‌نویسی
        </p>
      </div>
      <BlogListClient initialPosts={posts} />
    </div>
  );
}
