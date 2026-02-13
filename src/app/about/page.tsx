import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { getDonationData } from "@/lib/roadmap";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Heart,
  Github,
  CreditCard,
  TrendingUp,
  Calendar,
  Users,
  Code2,
  Globe,
} from "lucide-react";

export const metadata: Metadata = buildPageMetadata({
  title: "درباره DevRoad",
  description: "با تیم DevRoad، هدف پروژه و مسیر توسعه پلتفرم آموزش برنامه‌نویسی فارسی آشنا شوید.",
  path: "/about",
});

export default function AboutPage() {
  const donations = getDonationData();

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">درباره DevRoad</h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          DevRoad یک پلتفرم متن‌باز برای یادگیری برنامه‌نویسی به زبان فارسی
          است. هدف ما ایجاد یک منبع جامع و رایگان برای جامعه توسعه‌دهندگان
          ایرانی است.
        </p>
      </div>

      {/* Mission */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="text-center">
          <CardContent className="pt-6">
            <Code2 className="h-10 w-10 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">متن‌باز</h3>
            <p className="text-sm text-muted-foreground">
              کد منبع کاملاً باز و قابل مشارکت توسط همه
            </p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <Globe className="h-10 w-10 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">رایگان</h3>
            <p className="text-sm text-muted-foreground">
              تمام امکانات بدون هیچ هزینه‌ای در دسترس همه
            </p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <Users className="h-10 w-10 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">جامعه‌محور</h3>
            <p className="text-sm text-muted-foreground">
              ساخته شده توسط جامعه، برای جامعه
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Open Source */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            پروژه متن‌باز
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="leading-relaxed text-muted-foreground">
            این پروژه کاملاً{" "}
            <strong className="text-foreground">متن‌باز (Open Source)</strong>{" "}
            است و در جهت کاربردهای عام‌المنفعه توسعه داده شده است. هر کسی
            می‌تواند در توسعه نقشه راه‌ها، منابع آموزشی و بهبود پلتفرم مشارکت
            کند.
          </p>
          <p className="leading-relaxed text-muted-foreground">
            ما معتقدیم دسترسی به مسیر یادگیری درست و منابع با کیفیت باید برای
            همه رایگان باشد. اگر شما هم با این باور موافقید، خوشحال می‌شویم به
            ما بپیوندید.
          </p>
          <a
            href="https://github.com/tahadavari/DevRoad"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <Github className="h-4 w-4" />
            مشاهده کد منبع در GitHub
          </a>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* Donation */}
      <div className="text-center mb-8">
        <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">حمایت مالی</h2>
        <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">
          تنها هزینه این پروژه، هزینه زیرساخت به مبلغ{" "}
          <strong className="text-foreground">
            {formatPrice(donations.monthlyInfrastructureCost, donations.currency)}
          </strong>{" "}
          ماهانه است. شما می‌توانید با واریز به شماره کارت زیر از این پروژه
          حمایت کنید.
        </p>
      </div>

      {/* Card Number */}
      <Card className="mb-6 max-w-md mx-auto">
        <CardContent className="text-center py-8">
          <CreditCard className="h-8 w-8 text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground mb-2">شماره کارت</p>
          <p
            dir="ltr"
            className="text-2xl font-mono font-bold tracking-wider"
          >
            {donations.cardNumber}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            به نام: {donations.cardOwner}
          </p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
        <Card>
          <CardContent className="text-center py-6">
            <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {formatPrice(donations.totalCollected, donations.currency)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              مبلغ جمع‌آوری شده
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-6">
            <CreditCard className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {formatPrice(
                donations.monthlyInfrastructureCost,
                donations.currency
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              هزینه ماهانه زیرساخت
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-6">
            <Calendar className="h-6 w-6 text-purple-500 mx-auto mb-2" />
            <Badge variant="secondary" className="text-base">
              {donations.fundedUntil}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              هزینه‌ها تأمین شده تا
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="text-center py-6">
          <p className="text-sm text-muted-foreground">
            هزینه‌های زیرساخت تا {" "}
            <strong className="text-foreground">{donations.fundedUntil}</strong>{" "}
            تأمین شده است. از حمایت شما سپاسگزاریم!
          </p>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardContent className="text-center py-6">
          <p className="text-sm text-muted-foreground">
           جهت اسپانسرینگ هم می‌توانید با ایمیل tahadavari.dev@gmail.com در ارتباط باشید
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
