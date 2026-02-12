import Link from "next/link";
import { Map, Heart, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Map className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold">DevRoad</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              مسیر یادگیری برنامه‌نویسی به زبان فارسی. پروژه‌ای اوپن‌سورس برای
              جامعه توسعه‌دهندگان ایرانی.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-3">لینک‌های مفید</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/roadmaps" className="hover:text-primary transition-colors">
                  مسیرهای یادگیری
                </Link>
              </li>
              <li>
                <Link href="/forum" className="hover:text-primary transition-colors">
                  فوروم
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  درباره ما
                </Link>
              </li>
            </ul>
          </div>

          {/* Open Source */}
          <div>
            <h3 className="font-semibold mb-3">مشارکت</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              این پروژه کاملاً اوپن‌سورس است. شما هم می‌توانید مشارکت کنید!
            </p>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Github className="h-4 w-4" />
              مشاهده در GitHub
            </a>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-1">
            ساخته شده با
            <Heart className="h-3 w-3 text-red-500 fill-red-500" />
            برای جامعه توسعه‌دهندگان ایرانی
          </p>
        </div>
      </div>
    </footer>
  );
}
