import { notFound } from "next/navigation";
import { getRoadmap, getAllRoadmapSlugs } from "@/lib/roadmap";
import { ProjectsList } from "@/components/roadmap/projects-list";

export function generateStaticParams() {
  const slugs = getAllRoadmapSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const roadmap = getRoadmap(slug);
  if (!roadmap) notFound();

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">پروژه‌های {roadmap.title}</h1>
        <p className="mt-2 text-muted-foreground">
          با انجام این پروژه‌ها مهارت‌های خود را تقویت کنید. لینک ریپوزیتوری
          خود را ثبت کنید و بازخورد دریافت کنید.
        </p>
      </div>
      <ProjectsList projects={roadmap.projects} roadmapSlug={slug} />
    </div>
  );
}
