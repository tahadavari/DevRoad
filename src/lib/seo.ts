import type { Metadata } from "next";

const DEFAULT_SITE_URL = "https://devroad.ir";

export const siteConfig = {
  name: "DevRoad",
  title: "DevRoad | مسیر یادگیری برنامه‌نویسی",
  description:
    "DevRoad پلتفرم فارسی یادگیری برنامه‌نویسی با نقشه راه‌های گام‌به‌گام، پروژه‌های عملی، بلاگ تخصصی و انجمن پرسش‌وپاسخ است.",
  url: process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL,
  locale: "fa_IR",
  keywords: [
    "نقشه راه برنامه نویسی",
    "یادگیری برنامه نویسی",
    "مسیر یادگیری",
    "آموزش برنامه نویسی فارسی",
    "DevRoad",
    "منتورینگ برنامه نویسی",
  ],
};

export function getAbsoluteUrl(path = "") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, siteConfig.url).toString();
}

export function buildPageMetadata({
  title,
  description,
  path,
  keywords,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}): Metadata {
  const canonical = getAbsoluteUrl(path);

  return {
    title,
    description,
    keywords: keywords?.length ? keywords : siteConfig.keywords,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      images: [
        {
          url: getAbsoluteUrl("/og-image.svg"),
          width: 1200,
          height: 630,
          alt: "DevRoad - مسیر یادگیری برنامه‌نویسی",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [getAbsoluteUrl("/og-image.svg")],
    },
  };
}
