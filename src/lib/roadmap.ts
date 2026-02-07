import fs from "fs";
import path from "path";
import type { Roadmap, RoadmapIndex, DonationData } from "@/types";

const dataDir = path.join(process.cwd(), "data");

export function getRoadmapIndex(): RoadmapIndex {
  const filePath = path.join(dataDir, "roadmaps", "index.json");
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}

export function getRoadmap(slug: string): Roadmap | null {
  const filePath = path.join(dataDir, "roadmaps", `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}

export function getAllRoadmapSlugs(): string[] {
  const index = getRoadmapIndex();
  return index.roadmaps.map((r) => r.slug);
}

export function getDonationData(): DonationData {
  const filePath = path.join(dataDir, "donations.json");
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}

export function countAllSteps(roadmap: Roadmap): number {
  return roadmap.steps.reduce(
    (total, category) => {
      // Parent with children: count children
      // Parent without children (leaf): count parent itself as 1 step
      const childCount = category.children?.length ?? 0;
      return total + (childCount > 0 ? childCount : 1);
    },
    0
  );
}
