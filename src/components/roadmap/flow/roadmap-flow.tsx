"use client";

import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useReactFlow,
  ReactFlowProvider,
  type Node,
  type Edge,
  BackgroundVariant,
} from "@xyflow/react";
import { toPng } from "html-to-image";
import "@xyflow/react/dist/style.css";

import type {
  Roadmap,
  RoadmapCategory,
  RoadmapStep,
  RoadmapResource,
} from "@/types";
import { nodeTypes } from "./custom-nodes";
import { edgeTypes } from "./custom-edges";
import { Button } from "@/components/ui/button";
import { Download, HelpCircle } from "lucide-react";

const COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
];

interface RoadmapFlowProps {
  roadmap: Roadmap;
  completedSteps: Set<string>;
  isLoggedIn: boolean;
  currentStepId: string | null;
  onStepClick: (
    step: RoadmapStep | (RoadmapCategory & { resources: RoadmapResource[] })
  ) => void;
  onToggleStep: (stepId: string) => void;
}

function buildFlowData(
  roadmap: Roadmap,
  completedSteps: Set<string>,
  expandedCategories: Set<string>,
  expandAllForExport: boolean,
  onToggleStep: (stepId: string) => void
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const CATEGORY_GAP_X = 340;
  const CHILD_NODE_HEIGHT = 132;
  const CHILD_GAP_Y = 10;
  const CHILD_OFFSET_Y = 168;
  const START_X = 0;
  const CENTER_Y = 0;

  nodes.push({
    id: "title",
    type: "titleNode",
    position: { x: START_X, y: CENTER_Y },
    data: {
      label: roadmap.title,
      description:
        roadmap.description.substring(0, 55) +
        (roadmap.description.length > 55 ? "..." : ""),
      color: COLORS[0],
    },
    draggable: false,
  });

  let currentX = 380;

  roadmap.steps.forEach((category, catIndex) => {
    const catId = `cat-${category.id}`;
    const color = COLORS[catIndex % COLORS.length];
    const children = category.children || [];
    const hasChildren = children.length > 0;
    const isExpanded =
      expandAllForExport || expandedCategories.has(category.id);
    const showChildren = hasChildren && isExpanded;

    const resourceCount = category.resources?.length ?? 0;
    const completedChildIds = children.filter((c) => completedSteps.has(c.id));
    const isLeafCompleted =
      !hasChildren && completedSteps.has(category.id);

    nodes.push({
      id: catId,
      type: "categoryNode",
      position: { x: currentX, y: CENTER_Y },
      data: {
        label: category.title,
        description: category.description,
        order: category.order,
        hasChildren,
        hasResources: resourceCount > 0,
        resourceCount,
        childCount: children.length,
        isCompleted: isLeafCompleted,
        allChildrenCompleted:
          hasChildren &&
          children.length > 0 &&
          completedChildIds.length === children.length,
        completedChildCount: completedChildIds.length,
        color,
        categoryId: category.id,
        isExpanded: showChildren,
        stepId: category.id,
        onToggleStep,
        linkedRoadmapSlug: category.linkedRoadmapSlug,
      },
      draggable: true,
    });

    const prevId =
      catIndex === 0 ? "title" : `cat-${roadmap.steps[catIndex - 1].id}`;
    edges.push({
      id: `e-${prevId}-${catId}`,
      source: prevId,
      target: catId,
      sourceHandle: "right",
      targetHandle: "left",
      type: "smoothstep",
      animated: true,
      style: { stroke: "#6366f1", strokeWidth: 3 },
    });

    if (showChildren) {
      const totalChildHeight =
        children.length * CHILD_NODE_HEIGHT +
        (children.length - 1) * CHILD_GAP_Y;
      const startChildY = CENTER_Y + CHILD_OFFSET_Y;

      children.forEach((child, childIndex) => {
        const childId = `child-${child.id}`;
        const childY =
          startChildY +
          childIndex * (CHILD_NODE_HEIGHT + CHILD_GAP_Y);

        nodes.push({
          id: childId,
          type: "childNode",
          position: { x: currentX, y: childY },
          data: {
            label: child.title,
            description: child.description,
            resourceCount: child.resources.length,
            isCompleted: completedSteps.has(child.id),
            parentColor: color,
            childId: child.id,
            stepId: child.id,
            onToggleStep,
            linkedRoadmapSlug: child.linkedRoadmapSlug,
          },
          draggable: true,
        });

        edges.push({
          id: `e-${catId}-${childId}`,
          source: catId,
          target: childId,
          sourceHandle: "children",
          type: "branchEdge",
          data: { color },
        });
      });
    }

    currentX += CATEGORY_GAP_X;
  });

  return { nodes, edges };
}

function getFirstIncompleteStepId(
  roadmap: Roadmap,
  completedSteps: Set<string>
): string | null {
  for (const category of roadmap.steps) {
    const children = category.children || [];
    if (children.length > 0) {
      for (const child of children) {
        if (!completedSteps.has(child.id)) return `child-${child.id}`;
      }
    } else {
      if (!completedSteps.has(category.id)) return `cat-${category.id}`;
    }
  }
  return null;
}

function getParentCategoryIdForChild(
  roadmap: Roadmap,
  childNodeId: string
): string | null {
  if (!childNodeId.startsWith("child-")) return null;
  const stepId = childNodeId.replace("child-", "");
  for (const cat of roadmap.steps) {
    if (cat.children?.some((c) => c.id === stepId)) return cat.id;
  }
  return null;
}

function FlowInner({
  roadmap,
  completedSteps,
  isLoggedIn,
  currentStepId,
  onStepClick,
  onToggleStep,
}: RoadmapFlowProps) {
  const { fitView, setCenter } = useReactFlow();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    () => {
      if (!currentStepId || !currentStepId.startsWith("child-")) return new Set();
      const parentId = getParentCategoryIdForChild(roadmap, currentStepId);
      return parentId ? new Set([parentId]) : new Set();
    }
  );
  const [expandAllForExport, setExpandAllForExport] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const initialZoomDone = useRef(false);

  const { nodes, edges } = useMemo(
    () =>
      buildFlowData(
        roadmap,
        completedSteps,
        expandedCategories,
        expandAllForExport,
        onToggleStep
      ),
    [roadmap, completedSteps, expandedCategories, expandAllForExport, onToggleStep]
  );

  const toggleExpand = useCallback((categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  }, []);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (node.id === "title") return;

      const linkedSlug = (node.data as { linkedRoadmapSlug?: string }).linkedRoadmapSlug;
      if (linkedSlug) {
        window.location.href = `/roadmaps/${linkedSlug}`;
        return;
      }

      if (node.id.startsWith("cat-")) {
        const catId = (node.data as { categoryId?: string }).categoryId;
        const category = roadmap.steps.find((s) => s.id === catId);
        if (!category) return;

        const hasChildren = (category.children?.length ?? 0) > 0;

        if (hasChildren) {
          toggleExpand(category.id);
          return;
        }
        if ((category.resources?.length ?? 0) > 0) {
          onStepClick({
            ...category,
            resources: category.resources,
          } as RoadmapStep);
        }
        return;
      }

      if (node.id.startsWith("child-")) {
        const childId = (node.data as { childId?: string }).childId;
        if (!childId) return;
        for (const cat of roadmap.steps) {
          const child = cat.children?.find((c) => c.id === childId);
          if (child) {
            if ((child.resources?.length ?? 0) > 0) {
              onStepClick(child);
            }
            return;
          }
        }
      }
    },
    [roadmap, onStepClick, toggleExpand]
  );

  useEffect(() => {
    if (initialZoomDone.current || nodes.length === 0) return;
    initialZoomDone.current = true;

    const timer = setTimeout(() => {
      if (isLoggedIn && currentStepId) {
        const node = nodes.find((n) => n.id === currentStepId);
        if (node?.position) {
          setCenter(
            node.position.x + 120,
            node.position.y,
            { zoom: 0.9, duration: 600 }
          );
        } else {
          fitView({ padding: 0.35, duration: 500 });
        }
      } else {
        const firstCat = nodes.find((n) => n.id === "title");
        if (firstCat?.position) {
          setCenter(
            firstCat.position.x + 200,
            firstCat.position.y,
            { zoom: 0.85, duration: 500 }
          );
        } else {
          fitView({ padding: 0.4, duration: 500 });
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isLoggedIn, currentStepId, nodes, setCenter, fitView]);

  const handleExportPng = useCallback(() => {
    setExpandAllForExport(true);
    setIsExporting(true);
  }, []);

  useEffect(() => {
    if (!expandAllForExport || !isExporting) return;

    const runExport = () => {
      const flow = containerRef.current?.querySelector(
        ".react-flow"
      ) as HTMLElement | null;

      if (!flow) {
        setExpandAllForExport(false);
        setIsExporting(false);
        return;
      }

      fitView({ padding: 0.2, duration: 0 });
      const delay = 500;
      setTimeout(() => {
        const isDark = document.documentElement.classList.contains("dark");
        toPng(flow, {
          pixelRatio: 3,
          backgroundColor: isDark ? "#0a0a0a" : "#fafafa",
          cacheBust: true,
        })
          .then((dataUrl) => {
            const a = document.createElement("a");
            a.href = dataUrl;
            a.download = `roadmap-${roadmap.slug}-${Date.now()}.png`;
            a.click();
          })
          .catch(() => {})
          .finally(() => {
            setExpandAllForExport(false);
            setIsExporting(false);
          });
      }, delay);
    };

    const t = setTimeout(runExport, 350);
    return () => clearTimeout(t);
  }, [expandAllForExport, isExporting, roadmap.slug, fitView]);

  return (
    <div ref={containerRef} className="h-[700px] w-full rounded-xl border bg-background overflow-hidden relative">
      <style>{`
        @keyframes dashmove {
          to { stroke-dashoffset: -24; }
        }
        .react-flow__node { z-index: 10 !important; }
        .react-flow__controls { direction: ltr; }
        .react-flow__controls button {
          border-color: var(--color-border) !important;
          background: var(--color-card) !important;
          color: var(--color-foreground) !important;
          fill: var(--color-foreground) !important;
        }
        .react-flow__controls button:hover { background: var(--color-accent) !important; }
        .react-flow__attribution { display: none; }
      `}</style>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.35, maxZoom: 1.1 }}
        minZoom={0.15}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ animated: false }}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        panOnDrag={true}
        zoomOnScroll={true}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="var(--color-border)"
        />
        <Controls position="bottom-left" showInteractive={false} />
      </ReactFlow>

      <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
        <div className="relative group/guide">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-lg border-border bg-card/90 backdrop-blur-sm hover:bg-accent"
            title="راهنما"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
          <div className="pointer-events-none absolute top-full right-0 mt-2 hidden w-64 rounded-lg border bg-card/95 p-3 text-right text-xs shadow-lg backdrop-blur-sm group-hover/guide:block">
            <p className="font-medium text-muted-foreground mb-2">راهنما</p>
            <div className="space-y-1.5">
              <p>کلیک مرحله: باز/بست زیرمراحل یا منابع</p>
              <p>چک‌باکس: تکمیل یا بازگشت از تکمیل</p>
              <p>درگ: جابجایی نود</p>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleExportPng}
          disabled={isExporting}
          className="h-9 w-9 rounded-lg border-border bg-card/90 backdrop-blur-sm hover:bg-accent"
          title={isExporting ? "در حال ذخیره…" : "خروجی PNG"}
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function RoadmapFlow(props: RoadmapFlowProps) {
  return (
    <ReactFlowProvider>
      <FlowInner {...props} />
    </ReactFlowProvider>
  );
}

export { getFirstIncompleteStepId };
