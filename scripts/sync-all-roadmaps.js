/**
 * همگام‌سازی همهٔ نقشه‌های راه از roadmap.sh:
 * ۱) دریافت لیست از pages.json
 * ۲) برای هر roadmap: دریافت از api/v1-official-roadmap/{slug}
 * ۳) تبدیل به فرمت DevRoad و یکتا کردن idها
 * ۴) دریافت منابع رایگان هر تاپیک و ادغام
 * ۵) ذخیره در data/roadmaps/{slug}.json و به‌روزرسانی index.json
 *
 * استفاده:
 *   ROADMAP_SH_TOKEN=Bearer... node scripts/sync-all-roadmaps.js
 *   ROADMAP_SH_TOKEN=... node scripts/sync-all-roadmaps.js --slug=backend   # فقط یک نقشه
 */

const fs = require("fs");
const path = require("path");

const BASE_URL = "https://roadmap.sh";
const API_ROADMAP = `${BASE_URL}/api/v1-official-roadmap`;
const PAGES_URL = `${BASE_URL}/pages.json`;
const DATA_DIR = path.join(__dirname, "..", "data", "roadmaps");
const INDEX_FILE = path.join(DATA_DIR, "index.json");

const token = process.env.ROADMAP_SH_TOKEN || process.env.ROADMAP_SH_BEARER;
if (!token) {
  console.error("لطفاً ROADMAP_SH_TOKEN یا ROADMAP_SH_BEARER را تنظیم کنید.");
  process.exit(1);
}

const bearer = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
const onlySlug = process.argv.find((a) => a.startsWith("--slug="))?.split("=")[1];

// نقشه‌هایی که در DevRoad نمایش می‌دهیم (از pages فقط این‌ها را می‌گیریم)
const ROADMAP_ALLOWLIST = [
  "backend",
  "frontend",
  "devops",
  "android",
  "full-stack",
  "react",
  "nodejs",
  "python",
  "javascript",
  "typescript",
  "system-design",
  "computer-science",
  "sql",
  "docker",
  "kubernetes",
  "aws",
  "ai-engineer",
  "data-engineer",
  "cyber-security",
  "flutter",
  "ios",
  "golang",
  "rust",
  "java",
  "php",
  "git-github",
  "mongodb",
  "redis",
  "graphql",
  "api-design",
  "nextjs",
  "vue",
  "angular",
  "react-native",
  "qa",
  "ux-design",
  "blockchain",
  "machine-learning",
  "data-analyst",
  "devsecops",
  "software-architect",
  "postgresql-dba",
  "aspnet-core",
  "spring-boot",
  "laravel",
  "django",
  "ruby-on-rails",
  "terraform",
  "linux",
  "elasticsearch",
  "prompt-engineering",
  "ai-data-scientist",
  "mlops",
  "datastructures-and-algorithms",
  "product-manager",
  "technical-writer",
  "game-developer",
  "engineering-manager",
  "devrel",
  "cloudflare",
  "bi-analyst",
  "ai-agents",
  "code-review",
  "html",
  "css",
  "kotlin",
  "cpp",
  "swift-ui",
  "shell-bash",
  "wordpress",
  "ruby",
  "design-system",
  "software-design-architecture",
];

const ICON_COLORS = {
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

const TITLE_OVERRIDE = {
  backend: "توسعه‌دهنده بک‌اند",
  frontend: "توسعه‌دهنده فرانت‌اند",
  devops: "مهندس دواپس",
  android: "توسعه‌دهنده اندروید",
  main: "نقشه راه اصلی",
};

function slugify(title) {
  return (title || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function ensureUniqueIds(steps) {
  const used = new Set();
  function fix(obj, isChild = false) {
    if (!obj || typeof obj !== "object") return;
    if (obj.id != null) {
      let id = obj.id;
      if (used.has(id)) {
        let n = 2;
        while (used.has(id + "-" + n)) n++;
        id = id + "-" + n;
        obj.id = id;
      }
      used.add(obj.id);
    }
    if (Array.isArray(obj.children)) obj.children.forEach((c) => fix(c, true));
  }
  steps.forEach((s) => fix(s));
  return steps;
}

/** در حین تبدیل، stepId -> node.id را پر می‌کنیم تا بعداً برای fetch منابع استفاده شود */
let stepIdToNodeId;

function getStepIdToNodeId() {
  return stepIdToNodeId;
}

function convertApiToDevRoad(apiData) {
  const nodes = apiData.nodes || [];
  const edges = apiData.edges || [];
  const nodeMap = new Map();
  nodes.forEach((n) => {
    nodeMap.set(n.id, n);
    if (n.data?.oldId) nodeMap.set(n.data.oldId, n);
  });

  const childrenMap = new Map();
  const parentMap = new Map();
  edges.forEach((edge) => {
    const source = nodeMap.get(edge.source);
    const target = nodeMap.get(edge.target);
    if (!source || !target) return;
    if ((source.type === "topic" || source.type === "section") && target.type === "subtopic") {
      if (!childrenMap.has(source.id)) childrenMap.set(source.id, []);
      childrenMap.get(source.id).push(target.id);
      parentMap.set(target.id, source.id);
    } else if (source.type === "subtopic" && target.type === "subtopic") {
      if (!childrenMap.has(source.id)) childrenMap.set(source.id, []);
      childrenMap.get(source.id).push(target.id);
      parentMap.set(target.id, source.id);
    }
  });

  const topics = nodes.filter((n) => n.type === "topic");
  topics.sort((a, b) => (a.position?.y ?? 0) - (b.position?.y ?? 0));

  stepIdToNodeId = new Map();
  const slugCount = new Map();
  function makeId(label) {
    const base = slugify(label);
    const n = (slugCount.get(base) || 0) + 1;
    slugCount.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  }

  function toDevRoadStep(node, order) {
    if (!node) return null;
    const title = node.data?.label || "";
    const id = makeId(title);
    stepIdToNodeId.set(id, node.id);
    const childIds = childrenMap.get(node.id) || [];
    const children = childIds
      .map((nodeId, idx) => toDevRoadStep(nodeMap.get(nodeId), idx + 1))
      .filter(Boolean);
    return {
      id,
      title,
      description: `مباحث و تمرین‌های مرتبط با «${title}».`,
      order,
      children: children.length ? children : undefined,
      resources: [],
      recommendation: "",
    };
  }

  const steps = [];
  let order = 1;
  topics.forEach((topic) => {
    if (parentMap.has(topic.id)) return;
    const title = topic.data?.label || "";
    if (!title) return;
    const id = makeId(title);
    stepIdToNodeId.set(id, topic.id);
    const childIds = childrenMap.get(topic.id) || [];
    const children = childIds
      .map((nodeId, idx) => toDevRoadStep(nodeMap.get(nodeId), idx + 1))
      .filter(Boolean);
    if (children.length === 0) {
      steps.push({
        id,
        title,
        description: `مباحث و تمرین‌های مرتبط با «${title}».`,
        order: order++,
        children: [{ id: id + "-item", title, description: `مباحث و تمرین‌های مرتبط با «${title}».`, order: 1, children: [], resources: [], recommendation: "" }],
        resources: [],
        recommendation: "",
      });
    } else {
      steps.push({
        id,
        title,
        description: `مباحث و تمرین‌های مرتبط با «${title}».`,
        order: order++,
        children,
        resources: [],
        recommendation: "",
      });
    }
  });

  return ensureUniqueIds(steps);
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
  if (t.includes("course")) type = "course";
  else if (t.includes("video")) type = "video";
  else if (t.includes("playlist")) type = "playlist";
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
  const list =
    body?.resources ??
    body?.data?.resources ??
    body?.data?.links ??
    (Array.isArray(body) ? body : body?.data ? (Array.isArray(body.data) ? body.data : [body.data]) : []);
  const arr = Array.isArray(list) ? list : [];
  return arr
    .map(toDevRoadResource)
    .filter(Boolean)
    .filter((r) => r.price === "free");
}

async function fetchTopicResources(roadmapSlug, topicSlug, nodeId) {
  const url = `${BASE_URL}/${roadmapSlug}/${topicSlug}@${nodeId}.json`;
  try {
    const res = await fetch(url, {
      headers: { accept: "application/json", authorization: bearer, "content-type": "application/json" },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return extractResourcesFromResponse(data);
  } catch {
    return [];
  }
}

function mergeResources(existing, fromApi) {
  const byUrl = new Map();
  (existing || []).forEach((r) => byUrl.set(r.url, r));
  fromApi.forEach((r) => { if (!byUrl.has(r.url)) byUrl.set(r.url, r); });
  return Array.from(byUrl.values());
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { accept: "application/json", authorization: bearer, "content-type": "application/json" },
  });
  if (!res.ok) throw new Error(`${url} => ${res.status}`);
  return res.json();
}

async function syncOne(slug, pageInfo) {
  console.log(`\n📂 ${slug}`);
  const apiData = await fetchJson(`${API_ROADMAP}/${slug}`);
  const steps = convertApiToDevRoad(apiData);
  const stepIdToNodeIdMap = getStepIdToNodeId();

  const title = pageInfo?.title || slug;
  const description = (pageInfo?.description || "").replace(/@currentYear@/g, new Date().getFullYear());

  for (const step of steps) {
    const nodeId = stepIdToNodeIdMap?.get(step.id);
    const stepSlug = step.id.replace(/-(\d+)$/, "");
    if (nodeId) {
      const resources = await fetchTopicResources(slug, stepSlug, nodeId);
      if (resources.length) {
        step.resources = mergeResources(step.resources, resources);
        console.log(`  ✓ ${step.title}: ${resources.length} منبع`);
      }
      await new Promise((r) => setTimeout(r, 250));
    }
    for (let i = 0; i < (step.children || []).length; i++) {
      const child = step.children[i];
      const childNodeId = stepIdToNodeIdMap?.get(child.id);
      const childSlug = child.id.replace(/-(\d+)$/, "");
      if (childNodeId) {
        const resources = await fetchTopicResources(slug, childSlug, childNodeId);
        if (resources.length) {
          child.resources = mergeResources(child.resources, resources);
          console.log(`    ✓ ${child.title}: ${resources.length} منبع`);
        }
        await new Promise((r) => setTimeout(r, 250));
      }
    }
  }

  const meta = ICON_COLORS[slug] || ICON_COLORS.default;
  const totalSteps = steps.reduce((sum, s) => sum + (s.children?.length || 0) || 1, 0);
  const displayTitle = TITLE_OVERRIDE[slug] || title;

  const out = {
    slug,
    title: displayTitle,
    description: description,
    steps,
    projects: [],
  };

  const filePath = path.join(DATA_DIR, `${slug}.json`);
  fs.writeFileSync(filePath, JSON.stringify(out, null, 2), "utf-8");
  console.log(`  💾 ${filePath}`);

  return { slug, title: displayTitle, totalSteps, ...meta };
}

async function main() {
  let pages = [];
  try {
    pages = await fetchJson(PAGES_URL);
  } catch (e) {
    console.error("خطا در دریافت pages.json:", e.message);
    process.exit(1);
  }

  const roadmapsOnly = (pages || []).filter(
    (p) => p.group === "Roadmaps" && p.id && !p.url?.includes("/questions/") && !p.url?.includes("beginner")
  );

  const toSync = onlySlug
    ? roadmapsOnly.filter((p) => p.id === onlySlug)
    : roadmapsOnly.filter((p) => ROADMAP_ALLOWLIST.includes(p.id));

  if (toSync.length === 0) {
    console.log(onlySlug ? `نقشه‌ای با slug «${onlySlug}» در لیست نیست.` : "هیچ نقشه‌ای برای همگام‌سازی یافت نشد.");
    process.exit(0);
  }

  console.log(`همگام‌سازی ${toSync.length} نقشه: ${toSync.map((p) => p.id).join(", ")}`);

  const summaries = [];
  for (const page of toSync) {
    try {
      const summary = await syncOne(page.id, page);
      summaries.push(summary);
    } catch (e) {
      console.error(`  ❌ ${page.id}: ${e.message}`);
    }
  }

  const existingIndex = { roadmaps: [] };
  try {
    existingIndex.roadmaps = JSON.parse(fs.readFileSync(INDEX_FILE, "utf-8")).roadmaps || [];
  } catch {}

  const bySlug = new Map(existingIndex.roadmaps.map((r) => [r.slug, r]));
  summaries.forEach((s) => {
    const prev = bySlug.get(s.slug);
    bySlug.set(s.slug, {
      slug: s.slug,
      title: s.title,
      description: prev?.description || (s.title + " – نقشه راه یادگیری").substring(0, 80),
      icon: s.icon || "Map",
      color: s.color || "#6366f1",
      totalSteps: s.totalSteps || 0,
    });
  });

  const mainSlugs = ["main", "backend", "frontend", "android", "devops"];
  const ordered = [];
  mainSlugs.forEach((slug) => {
    if (bySlug.has(slug)) ordered.push(bySlug.get(slug));
  });
  bySlug.forEach((v, slug) => {
    if (!mainSlugs.includes(slug)) ordered.push(v);
  });

  fs.writeFileSync(INDEX_FILE, JSON.stringify({ roadmaps: ordered }, null, 2), "utf-8");
  console.log("\n✅ index.json به‌روزرسانی شد.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
