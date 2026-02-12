import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRoadmap, getAllRoadmapSlugs, getRoadmapIndex } from "@/lib/roadmap";
import { RoadmapView } from "@/components/roadmap/roadmap-view";
import { buildPageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  const slugs = getAllRoadmapSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const index = getRoadmapIndex();
  const roadmapSummary = index.roadmaps.find((r) => r.slug === slug);

  if (!roadmapSummary) {
    return buildPageMetadata({
      title: "رودمپ",
      description: "مسیر یادگیری برنامه‌نویسی در DevRoad",
      path: `/roadmaps/${slug}`,
    });
  }

  return buildPageMetadata({
    title: `${roadmapSummary.title} رودمپ یادگیری`,
    description: roadmapSummary.description,
    path: `/roadmaps/${slug}`,
    keywords: [
      roadmapSummary.title,
      `${roadmapSummary.title} roadmap`,
      "یادگیری برنامه نویسی",
      "رودمپ فارسی",
    ],
  });
}

export default async function RoadmapPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const roadmap = getRoadmap(slug);
  if (!roadmap) notFound();

  return <RoadmapView roadmap={roadmap} />;
}
