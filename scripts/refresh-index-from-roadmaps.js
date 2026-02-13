/**
 * به‌روزرسانی index.json بر اساس فایل‌های roadmap موجود در data/roadmaps
 * بدون نیاز به API یا توکن. totalSteps و لیست نقشه‌ها را با فایل‌های .json همگام می‌کند.
 *
 * استفاده: node scripts/refresh-index-from-roadmaps.js
 */

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data", "roadmaps");
const INDEX_FILE = path.join(DATA_DIR, "index.json");

const ICON_COLORS = {
  main: { icon: "Map", color: "#6366f1" },
  backend: { icon: "Server", color: "#3b82f6" },
  frontend: { icon: "Monitor", color: "#8b5cf6" },
  devops: { icon: "Cloud", color: "#10b981" },
  android: { icon: "Smartphone", color: "#22c55e" },
  "full-stack": { icon: "Layers", color: "#f59e0b" },
  react: { icon: "Atom", color: "#61dafb" },
  nodejs: { icon: "Server", color: "#68a063" },
  python: { icon: "Code", color: "#3776ab" },
  javascript: { icon: "FileCode", color: "#f7df1e" },
  default: { icon: "Map", color: "#6366f1" },
};

const MAIN_SLUGS_ORDER = ["main", "backend", "frontend", "android", "devops"];

function totalStepsFromRoadmap(roadmap) {
  return (roadmap.steps || []).reduce(
    (sum, s) => sum + (s.children?.length || 0) || 1,
    0
  );
}

function main() {
  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json") && f !== "index.json");
  const existingIndex = { roadmaps: [] };
  try {
    existingIndex.roadmaps = JSON.parse(fs.readFileSync(INDEX_FILE, "utf-8")).roadmaps || [];
  } catch {}

  const bySlug = new Map(existingIndex.roadmaps.map((r) => [r.slug, r]));

  for (const file of files) {
    const slug = file.replace(/\.json$/, "");
    const filePath = path.join(DATA_DIR, file);
    let roadmap;
    try {
      roadmap = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch (e) {
      console.warn(`  ⚠ نادیده: ${file} (خطا در خواندن)`);
      continue;
    }
    const totalSteps = totalStepsFromRoadmap(roadmap);
    const title = roadmap.title || slug;
    const description = roadmap.description || (title + " – نقشه راه یادگیری").substring(0, 80);
    const meta = ICON_COLORS[slug] || ICON_COLORS.default;
    const prev = bySlug.get(slug);
    bySlug.set(slug, {
      slug,
      title,
      description: prev?.description || description,
      icon: prev?.icon || meta.icon,
      color: prev?.color || meta.color,
      totalSteps,
    });
  }

  const ordered = [];
  MAIN_SLUGS_ORDER.forEach((slug) => {
    if (bySlug.has(slug)) ordered.push(bySlug.get(slug));
  });
  bySlug.forEach((v, slug) => {
    if (!MAIN_SLUGS_ORDER.includes(slug)) ordered.push(v);
  });

  fs.writeFileSync(INDEX_FILE, JSON.stringify({ roadmaps: ordered }, null, 2), "utf-8");
  console.log("✅ index.json با", ordered.length, "نقشه به‌روزرسانی شد.");
}

main();
