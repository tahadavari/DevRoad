/**
 * فقط تگ‌های توصیه (توصیه می‌شود / جایگزین / در صورت علاقه) را از roadmap.sh
 * روی فایل‌های موجود data/roadmaps/*.json اعمال می‌کند. منبع (resource) فچ نمی‌شود.
 *
 * استفاده:
 *   ROADMAP_SH_BEARER="Bearer ..." node scripts/sync-roadmap-tags.js
 *   ROADMAP_SH_BEARER="Bearer ..." node scripts/sync-roadmap-tags.js --slug=backend
 */

const fs = require("fs");
const path = require("path");

const BASE_URL = "https://roadmap.sh";
const API_ROADMAP = `${BASE_URL}/api/v1-official-roadmap`;
const DATA_DIR = path.join(__dirname, "..", "data", "roadmaps");

const token = process.env.ROADMAP_SH_TOKEN || process.env.ROADMAP_SH_BEARER;
if (!token) {
  console.error("لطفاً ROADMAP_SH_TOKEN یا ROADMAP_SH_BEARER را تنظیم کنید.");
  process.exit(1);
}

const bearer = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
const onlySlug = process.argv.find((a) => a.startsWith("--slug="))?.split("=")[1];

function slugify(title) {
  return (title || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function legendToRecommendation(legend) {
  if (!legend?.label) return "";
  const label = (legend.label || "").toLowerCase();
  if (label.includes("personal recommendation") || label.includes("opinion")) return "personal";
  if (label.includes("alternative option") || label.includes("pick this or purple")) return "alternative";
  if (label.includes("order not strict") || label.includes("learn anytime")) return "flexible";
  return "";
}

const PASS_THROUGH_TYPES = new Set(["vertical", "horizontal", "paragraph"]);

/** از apiData نقشهٔ stepId -> recommendation و title -> recommendation می‌سازد. */
function buildRecommendationMaps(apiData) {
  const nodes = apiData.nodes || [];
  const edges = apiData.edges || [];
  const nodeMap = new Map();
  nodes.forEach((n) => {
    nodeMap.set(n.id, n);
    if (n.data?.oldId) nodeMap.set(n.data.oldId, n);
  });

  const outEdges = new Map();
  edges.forEach((edge) => {
    if (!outEdges.has(edge.source)) outEdges.set(edge.source, []);
    outEdges.get(edge.source).push(edge.target);
  });

  function getReachableSubtopics(startId) {
    const visited = new Set();
    const result = [];
    function dfs(id) {
      if (visited.has(id)) return;
      visited.add(id);
      const targets = outEdges.get(id) || [];
      for (const tid of targets) {
        const tnode = nodeMap.get(tid);
        if (!tnode) continue;
        if (tnode.type === "subtopic") result.push(tid);
        else if (PASS_THROUGH_TYPES.has(tnode.type)) dfs(tid);
      }
    }
    dfs(startId);
    return result;
  }

  const childrenMap = new Map();
  const parentMap = new Map();
  edges.forEach((edge) => {
    const source = nodeMap.get(edge.source);
    const target = nodeMap.get(edge.target);
    if (!source || !target) return;
    if (source.type === "subtopic" && target.type === "subtopic") {
      if (!childrenMap.has(source.id)) childrenMap.set(source.id, []);
      childrenMap.get(source.id).push(target.id);
      parentMap.set(target.id, source.id);
    }
  });

  nodes
    .filter((n) => (n.type === "topic" || n.type === "section") && !parentMap.has(n.id))
    .forEach((node) => {
      const reachable = getReachableSubtopics(node.id);
      if (reachable.length > 0) {
        childrenMap.set(node.id, reachable);
        reachable.forEach((subId) => parentMap.set(subId, node.id));
      }
    });

  const stepIdToRec = new Map();
  const titleToRec = new Map();
  const slugCount = new Map();
  function makeId(label) {
    const base = slugify(label);
    const n = (slugCount.get(base) || 0) + 1;
    slugCount.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  }

  /** API گاهی legend را در node.data.legend برمی‌گرداند (مثلاً "Personal Recommendation / Opinion"). */
  function getLegend(node) {
    return node?.legend || node?.data?.legend;
  }

  function walk(node) {
    if (!node) return;
    const title = (node.data?.label || "").trim();
    const id = makeId(title);
    const rec = legendToRecommendation(getLegend(node));
    if (rec) {
      stepIdToRec.set(id, rec);
      if (title) titleToRec.set(title, rec);
    }
    const childIds = childrenMap.get(node.id) || [];
    childIds.forEach((nodeId) => walk(nodeMap.get(nodeId)));
  }

  const topics = nodes.filter((n) => n.type === "topic");
  topics.sort((a, b) => (a.position?.y ?? 0) - (b.position?.y ?? 0));
  topics.forEach((topic) => {
    if (parentMap.has(topic.id)) return;
    const title = (topic.data?.label || "").trim();
    if (!title) return;
    const id = makeId(title);
    const rec = legendToRecommendation(getLegend(topic));
    if (rec) {
      stepIdToRec.set(id, rec);
      titleToRec.set(title, rec);
    }
    const childIds = childrenMap.get(topic.id) || [];
    childIds.forEach((nodeId) => walk(nodeMap.get(nodeId)));
  });

  return { stepIdToRec, titleToRec };
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { accept: "application/json", authorization: bearer, "content-type": "application/json" },
  });
  if (!res.ok) throw new Error(`${url} => ${res.status}`);
  return res.json();
}

function applyRecommendations(roadmap, stepIdToRec, titleToRec) {
  let updated = 0;
  for (const category of roadmap.steps || []) {
    const rec = stepIdToRec.get(category.id) ?? titleToRec.get((category.title || "").trim());
    if (rec !== undefined && rec !== "") {
      category.recommendation = rec;
      updated++;
    }
    for (const child of category.children || []) {
      const childRec = stepIdToRec.get(child.id) ?? titleToRec.get((child.title || "").trim());
      if (childRec !== undefined && childRec !== "") {
        child.recommendation = childRec;
        updated++;
      }
    }
  }
  return updated;
}

async function main() {
  const indexPath = path.join(DATA_DIR, "index.json");
  let slugs = [];
  try {
    const index = JSON.parse(fs.readFileSync(indexPath, "utf-8"));
    slugs = (index.roadmaps || []).map((r) => r.slug).filter(Boolean);
  } catch {
    slugs = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json") && f !== "index.json").map((f) => f.replace(/\.json$/, ""));
  }
  if (onlySlug) {
    slugs = slugs.filter((s) => s === onlySlug);
    if (slugs.length === 0) slugs = [onlySlug];
  }

  console.log("سینک فقط تگ‌های توصیه (بدون فچ منابع) برای:", slugs.length, "نقشه");
  for (const slug of slugs) {
    const filePath = path.join(DATA_DIR, `${slug}.json`);
    if (!fs.existsSync(filePath)) {
      console.log(`  ⏭ ${slug}: فایل وجود ندارد، رد شد`);
      continue;
    }
    try {
      const roadmap = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      const apiData = await fetchJson(`${API_ROADMAP}/${slug}`);
      const { stepIdToRec, titleToRec } = buildRecommendationMaps(apiData);
      if (process.env.DEBUG_TAGS && (slug === "backend" || onlySlug === slug)) {
        console.log(`  [debug] stepIdToRec size: ${stepIdToRec.size}, titleToRec size: ${titleToRec.size}`);
        const withLegend = (apiData.nodes || []).filter((n) => (n.legend || n.data?.legend)?.label);
        console.log(`  [debug] API nodes with legend: ${withLegend.length}, total nodes: ${(apiData.nodes || []).length}`);
        if (withLegend.length) console.log(`  [debug] sample legend:`, (withLegend[0].legend || withLegend[0].data?.legend)?.label);
      }
      const updated = applyRecommendations(roadmap, stepIdToRec, titleToRec);
      fs.writeFileSync(filePath, JSON.stringify(roadmap, null, 2), "utf-8");
      console.log(`  ✓ ${slug}: ${updated} تگ به‌روز شد`);
    } catch (e) {
      console.error(`  ❌ ${slug}: ${e.message}`);
    }
  }
  console.log("\n✅ انجام شد.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
