/**
 * برای هر استپ/چایلد در backend.json، با API نقشه‌ی roadmap.sh
 * منابع آن تاپیک را می‌گیرد و فقط منابع رایگان را با فرمت DevRoad اضافه می‌کند.
 *
 * استفاده:
 *   ROADMAP_SH_TOKEN=Bearer... node scripts/fetch-roadmap-sh-resources.js
 * یا در .env.local قرار دهید: ROADMAP_SH_TOKEN=eyJhbGc...
 */

const fs = require("fs");
const path = require("path");

const SH_FILE = path.join(__dirname, "..", "data", "roadmaps", "backend-roadmap.sh.json");
const BACKEND_FILE = path.join(__dirname, "..", "data", "roadmaps", "backend.json");
const ROADMAP_SLUG = "backend";
const BASE_URL = "https://roadmap.sh";

const token = process.env.ROADMAP_SH_TOKEN || process.env.ROADMAP_SH_BEARER;
if (!token) {
  console.error("لطفاً ROADMAP_SH_TOKEN یا ROADMAP_SH_BEARER را تنظیم کنید.");
  process.exit(1);
}

const bearer = token.startsWith("Bearer ") ? token : `Bearer ${token}`;

function slugify(title) {
  return (title || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildSlugToNodeId(shData) {
  const map = new Map();
  (shData.nodes || []).forEach((node) => {
    if (node.type !== "topic" && node.type !== "subtopic") return;
    const label = node.data?.label || "";
    if (!label) return;
    const slug = slugify(label);
    map.set(slug, node.id);
  });
  return map;
}

function toDevRoadResource(item) {
  const title = item.title || item.name || item.label || "";
  const url = item.url || item.link || item.href || "";
  if (!url && !title) return null;

  let price = "free";
  let priceAmount = 0;
  if (item.paid === true || item.price === "paid" || (item.priceAmount && item.priceAmount > 0)) {
    price = "paid";
    priceAmount = Number(item.priceAmount) || 0;
  }

  let type = "article";
  const t = (item.type || item.resourceType || "").toLowerCase();
  if (t.includes("course") || t === "course") type = "course";
  else if (t.includes("video") || t === "video") type = "video";
  else if (t.includes("playlist") || t === "playlist") type = "playlist";

  return {
    title: title || url,
    type,
    url: url || "#",
    price,
    priceAmount,
    duration: item.duration || "",
    language: item.language === "fa" ? "fa" : "en",
    description: item.description || "",
  };
}

function extractResourcesFromResponse(body) {
  const list = body?.resources ?? body?.data?.resources ?? body?.data?.links ?? (Array.isArray(body) ? body : body?.data ? (Array.isArray(body.data) ? body.data : [body.data]) : []);
  const arr = Array.isArray(list) ? list : [];
  return arr
    .map(toDevRoadResource)
    .filter(Boolean)
    .filter((r) => r.price === "free");
}

async function fetchTopicResources(slug, nodeId) {
  const url = `${BASE_URL}/${ROADMAP_SLUG}/${slug}@${nodeId}.json`;
  try {
    const res = await fetch(url, {
      headers: {
        accept: "application/json",
        authorization: bearer,
        "content-type": "application/json",
      },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return extractResourcesFromResponse(data);
  } catch (e) {
    console.warn(`  ⚠ ${slug}: ${e.message}`);
    return [];
  }
}

function mergeResources(existing, fromApi) {
  const byUrl = new Map();
  (existing || []).forEach((r) => byUrl.set(r.url, r));
  fromApi.forEach((r) => {
    if (!byUrl.has(r.url)) byUrl.set(r.url, r);
  });
  return Array.from(byUrl.values());
}

async function main() {
  const shData = JSON.parse(fs.readFileSync(SH_FILE, "utf-8"));
  const backend = JSON.parse(fs.readFileSync(BACKEND_FILE, "utf-8"));
  const slugToNodeId = buildSlugToNodeId(shData);

  let totalFetched = 0;
  let totalAdded = 0;

  const steps = backend.steps || [];
  for (const step of steps) {
    const stepSlug = step.id || slugify(step.title);
    const nodeId = slugToNodeId.get(stepSlug);
    if (nodeId) {
      const resources = await fetchTopicResources(stepSlug, nodeId);
      totalFetched += resources.length;
      if (resources.length > 0) {
        step.resources = mergeResources(step.resources, resources);
        totalAdded += resources.length;
        console.log(`  ✓ ${step.title}: ${resources.length} منبع رایگان`);
      }
      await new Promise((r) => setTimeout(r, 300));
    }

    const children = step.children || [];
    for (const child of children) {
      const childSlug = child.id || slugify(child.title);
      const childNodeId = slugToNodeId.get(childSlug);
      if (childNodeId) {
        const resources = await fetchTopicResources(childSlug, childNodeId);
        totalFetched += resources.length;
        if (resources.length > 0) {
          child.resources = mergeResources(child.resources, resources);
          totalAdded += resources.length;
          console.log(`    ✓ ${child.title}: ${resources.length} منبع رایگان`);
        }
        await new Promise((r) => setTimeout(r, 300));
      }
    }
  }

  fs.writeFileSync(BACKEND_FILE, JSON.stringify(backend, null, 2), "utf-8");
  console.log("\n✅ backend.json به‌روزرسانی شد.");
  console.log(`   منابع دریافتی (رایگان): ${totalAdded}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
