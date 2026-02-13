import type { Metadata } from "next";
import Link from "next/link";
import { getRoadmapIndex } from "@/lib/roadmap";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buildPageMetadata } from "@/lib/seo";
import { Map, ArrowLeft, Server, Monitor, Cloud, Smartphone } from "lucide-react";

export const metadata: Metadata = buildPageMetadata({
  title: "نقشه راه‌های برنامه‌نویسی",
  description:
    "بهترین نقشه راه‌های فارسی برنامه‌نویسی برای بک‌اند، فرانت‌اند، موبایل و دواپس را ببینید و مسیر یادگیری‌تان را گام‌به‌گام شروع کنید.",
  path: "/roadmaps",
});

const iconMap: Record<string, React.ReactNode> = {
  Server: <Server className="h-8 w-8" />,
  Monitor: <Monitor className="h-8 w-8" />,
  Cloud: <Cloud className="h-8 w-8" />,
  Smartphone: <Smartphone className="h-8 w-8" />,
};

export default function RoadmapsPage() {
  const { roadmaps } = getRoadmapIndex();

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold">مسیرهای یادگیری</h1>
        <p className="mt-2 text-muted-foreground">
          یکی از مسیرهای زیر را انتخاب کنید و سفر یادگیری خود را آغاز کنید.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roadmaps.map((roadmap) => (
          <Link key={roadmap.slug} href={`/roadmaps/${roadmap.slug}`}>
            <Card className="h-full hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer group">
              <CardHeader>
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-xl text-white mb-2 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: roadmap.color }}
                >
                  {iconMap[roadmap.icon] || <Map className="h-8 w-8" />}
                </div>
                <CardTitle className="text-xl">{roadmap.title}</CardTitle>
                <CardDescription className="leading-relaxed">
                  {roadmap.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <Badge variant="secondary">{roadmap.totalSteps} مرحله</Badge>
                  <span className="flex items-center gap-1 text-primary group-hover:gap-2 transition-all">
                    مشاهده نقشه راه
                    <ArrowLeft className="h-3 w-3" />
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
