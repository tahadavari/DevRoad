import Link from "next/link";
import { getRoadmapIndex } from "@/lib/roadmap";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Map,
  ArrowLeft,
  Users,
  BookOpen,
  MessageSquare,
  Server,
  Monitor,
  Cloud,
  Smartphone,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  Server: <Server className="h-8 w-8" />,
  Monitor: <Monitor className="h-8 w-8" />,
  Cloud: <Cloud className="h-8 w-8" />,
  Smartphone: <Smartphone className="h-8 w-8" />,
};

export default function HomePage() {
  const { roadmaps } = getRoadmapIndex();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4">
              پروژه اوپن‌سورس
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              مسیر یادگیری{" "}
              <span className="text-primary">برنامه‌نویسی</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              با دوراه، مسیر یادگیری خود را در دنیای برنامه‌نویسی پیدا کنید.
              رودمپ‌های جامع، پروژه‌های عملی، منتورینگ و فوروم‌های تخصصی
              همگی در یک مکان.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/roadmaps">
                <Button size="lg" className="gap-2">
                  <Map className="h-5 w-5" />
                  مشاهده مسیرها
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="lg" className="gap-2">
                  ثبت‌نام رایگان
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">چرا دوراه؟</h2>
          <p className="mt-3 text-muted-foreground">
            همه‌چیز برای شروع و پیشرفت در مسیر برنامه‌نویسی
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BookOpen className="h-6 w-6" />
              </div>
              <CardTitle className="mt-4">رودمپ‌های جامع</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                مسیرهای یادگیری گام به گام با منابع پیشنهادی فارسی و انگلیسی
                برای هر سطحی.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="h-6 w-6" />
              </div>
              <CardTitle className="mt-4">منتورشیپ</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                منتورهای با تجربه پروژه‌هایتان را بررسی می‌کنند و بازخورد حرفه‌ای
                ارائه می‌دهند.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MessageSquare className="h-6 w-6" />
              </div>
              <CardTitle className="mt-4">فوروم تخصصی</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                سوالاتتان را بپرسید و از تجربه جامعه بهره‌مند شوید. هر مسیر
                فوروم اختصاصی خودش را دارد.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Roadmaps Preview */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">مسیرهای یادگیری</h2>
            <p className="mt-3 text-muted-foreground">
              مسیر خود را انتخاب کنید و شروع کنید
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
                      {iconMap[roadmap.icon] || (
                        <Map className="h-8 w-8" />
                      )}
                    </div>
                    <CardTitle className="text-xl">{roadmap.title}</CardTitle>
                    <CardDescription className="leading-relaxed">
                      {roadmap.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{roadmap.totalSteps} مرحله</span>
                      <span className="flex items-center gap-1 text-primary group-hover:gap-2 transition-all">
                        شروع کنید
                        <ArrowLeft className="h-3 w-3" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
