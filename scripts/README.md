# اسکریپت‌های همگام‌سازی با roadmap.sh

## پیش‌نیاز

متغیر محیطی توکن (یکی از دو مورد):

- `ROADMAP_SH_TOKEN` یا `ROADMAP_SH_BEARER`: توکن Bearer اکانت roadmap.sh

## همگام‌سازی همهٔ نقشه‌ها

```bash
# ویندوز (PowerShell)
$env:ROADMAP_SH_BEARER="Bearer YOUR_TOKEN"; node scripts/sync-all-roadmaps.js

# فقط یک نقشه (مثلاً backend)
$env:ROADMAP_SH_BEARER="Bearer YOUR_TOKEN"; node scripts/sync-all-roadmaps.js --slug=backend
```

این اسکریپت:

1. لیست نقشه‌ها را از `https://roadmap.sh/pages.json` می‌گیرد.
2. برای هر نقشه (طبق allowlist) از `https://roadmap.sh/api/v1-official-roadmap/{slug}` ساختار را می‌گیرد.
3. آن را به فرمت DevRoad تبدیل و idهای تکراری را یکتا می‌کند.
4. برای هر تاپیک/زیرتاپیک منابع رایگان را از API می‌گیرد و ادغام می‌کند.
5. فایل‌های `data/roadmaps/{slug}.json` و `data/roadmaps/index.json` را به‌روزرسانی می‌کند.

## فقط به‌روزرسانی منابع یک نقشه (بدون تبدیل مجدد)

اگر فقط `backend.json` را دارید و می‌خواهید منابع را از API پر کنید:

```bash
$env:ROADMAP_SH_BEARER="Bearer YOUR_TOKEN"; node scripts/fetch-roadmap-sh-resources.js
```

(این اسکریپت فقط backend و فایل `backend-roadmap.sh.json` را پشتیبانی می‌کند؛ برای بقیه از `sync-all-roadmaps.js` استفاده کنید.)
