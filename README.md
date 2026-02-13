# DevRoad

مسیر یادگیری برنامه‌نویسی به زبان فارسی - پروژه متن‌باز

## ویژگی‌ها

- **نقشه راه‌های یادگیری**: مسیرهای جامع برای بک‌اند، فرانت‌اند، دواپس و...
- **منابع پیشنهادی**: ویدیو، مقاله، دوره و پلی‌لیست برای هر مرحله
- **پروژه‌های عملی**: پروژه‌ها در سه سطح (مبتدی، متوسط، پیشرفته)
- **فوروم تخصصی**: سوال و جواب مشابه StackOverflow برای هر مسیر
- **سیستم منتورشیپ**: بازخورد منتورها روی پروژه‌ها و پاسخ‌های اولویت‌دار
- **داشبورد شخصی**: پیگیری پیشرفت در هر مسیر
- **سیستم پیام‌رسانی**: اعلان‌ها برای پاسخ‌ها و تاییدها
- **پنل ادمین**: مدیریت کاربران و نقش‌ها

## تکنولوژی‌ها

- **فریمورک**: Next.js 15 (App Router)
- **رابط کاربری**: shadcn/ui + Tailwind CSS
- **دیتابیس**: PostgreSQL + Prisma ORM
- **احراز هویت**: JWT + Cookie-based
- **زبان**: فارسی (RTL)
- **فونت**: وزیرمتن

## نصب و راه‌اندازی

### پیش‌نیازها

- Node.js 20+
- PostgreSQL 16+
- یا Docker + Docker Compose

### با Docker (پیشنهادی)

```bash
# Clone the repository
git clone https://github.com/your-username/devroad.git
cd devroad

# Start services
docker compose up -d

# Run database migrations
docker compose exec app npx prisma migrate deploy

# Seed database
docker compose exec app npx prisma db seed
```

### بدون Docker

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your database and SMTP credentials

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database
npx prisma db seed

# Start development server
npm run dev
```

سپس `http://localhost:3000` را باز کنید.

### کاربر ادمین پیش‌فرض

- ایمیل: `admin@devroad.ir`
- رمز عبور: `admin123456`

## ساختار پروژه

```
devroad/
├── data/                  # داده‌های JSON (نقشه راه‌ها، منابع، مالی)
│   ├── roadmaps/
│   │   ├── index.json    # لیست نقشه راه‌ها
│   │   ├── backend.json  # نقشه راه بک‌اند
│   │   ├── frontend.json # نقشه راه فرانت‌اند
│   │   └── devops.json   # نقشه راه دواپس
│   └── donations.json    # اطلاعات حمایت مالی
├── prisma/
│   ├── schema.prisma     # مدل‌های دیتابیس
│   └── seed.ts           # داده‌های اولیه
├── src/
│   ├── app/              # صفحات و API‌ها (Next.js App Router)
│   ├── components/       # کامپوننت‌های React
│   ├── lib/              # توابع کمکی و لایبرری‌ها
│   └── types/            # تایپ‌های TypeScript
├── docker-compose.yml
├── Dockerfile
└── README.md
```

## مشارکت

### اضافه کردن نقشه راه جدید

1. یک فایل JSON جدید در `data/roadmaps/` بسازید (مثلاً `data-science.json`)
2. نقشه راه را به `data/roadmaps/index.json` اضافه کنید
3. ساختار JSON مشابه فایل‌های موجود باشد
4. Pull Request بزنید!

### اضافه کردن منبع

1. فایل نقشه راه مربوطه را ویرایش کنید
2. منبع جدید را به آرایه `resources` استپ مورد نظر اضافه کنید
3. Pull Request بزنید!

## لایسنس

MIT License
