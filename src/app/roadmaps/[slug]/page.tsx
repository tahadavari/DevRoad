import { notFound } from "next/navigation";
import { getRoadmap, getAllRoadmapSlugs, getRoadmapIndex } from "@/lib/roadmap";
import { RoadmapView } from "@/components/roadmap/roadmap-view";

export function generateStaticParams() {
  const slugs = getAllRoadmapSlugs();
  return slugs.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  // This is a sync function wrapper for metadata generation
  return params.then(({ slug }) => {
    const index = getRoadmapIndex();
    const roadmapSummary = index.roadmaps.find((r) => r.slug === slug);
    return {
      title: roadmapSummary ? `${roadmapSummary.title} - DevRoad` : "DevRoad",
      description: roadmapSummary?.description || "",
    };
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
