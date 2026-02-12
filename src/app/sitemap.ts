import type { MetadataRoute } from "next";
import { getAllRoadmapSlugs } from "@/lib/roadmap";
import { getBlogSlugs } from "@/lib/blog";
import { getAbsoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = ["", "/roadmaps", "/blog", "/about", "/forum"];
  const staticPages = staticRoutes.map((route) => ({
    url: getAbsoluteUrl(route),
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  const roadmapPages = getAllRoadmapSlugs().map((slug) => ({
    url: getAbsoluteUrl(`/roadmaps/${slug}`),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const blogPages = getBlogSlugs().map((slug) => ({
    url: getAbsoluteUrl(`/blog/${slug}`),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...roadmapPages, ...blogPages];
}
