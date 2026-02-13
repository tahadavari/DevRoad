import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
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
import { MessageSquare, ArrowLeft, Server, Monitor, Cloud, Map, Smartphone } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  Server: <Server className="h-6 w-6" />,
  Monitor: <Monitor className="h-6 w-6" />,
  Cloud: <Cloud className="h-6 w-6" />,
  Smartphone: <Smartphone className="h-6 w-6" />,
};

export const metadata: Metadata = buildPageMetadata({
  title: "فوروم‌های DevRoad",
  description: "فوروم تخصصی پرسش‌وپاسخ DevRoad برای مسیرهای مختلف برنامه‌نویسی.",
  path: "/forum",
});

export default function ForumIndexPage() {
  const { roadmaps } = getRoadmapIndex();

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-primary" />
          فوروم‌ها
        </h1>
        <p className="mt-2 text-muted-foreground">
          هر مسیر یادگیری فوروم اختصاصی خودش را دارد. سوال بپرسید و از جامعه
          کمک بگیرید.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roadmaps.map((roadmap) => (
          <Link key={roadmap.slug} href={`/forum/${roadmap.slug}`}>
            <Card className="h-full hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer group">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-white"
                    style={{ backgroundColor: roadmap.color }}
                  >
                    {iconMap[roadmap.icon] || <Map className="h-6 w-6" />}
                  </div>
                  <div>
                    <CardTitle>{roadmap.title}</CardTitle>
                    <CardDescription>فوروم تخصصی</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <Badge variant="secondary">
                    <MessageSquare className="h-3 w-3 ml-1" />
                    مشاهده سوالات
                  </Badge>
                  <ArrowLeft className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
