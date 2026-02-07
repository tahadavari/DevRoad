"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  BookOpen,
  Sparkles,
  Check,
  ExternalLink,
} from "lucide-react";

// ─── Title Node (Top of roadmap) ──────────────────────────────
export interface TitleNodeData {
  label: string;
  description: string;
  color: string;
  [key: string]: unknown;
}

export const TitleNode = memo(function TitleNode({ data }: NodeProps) {
  const d = data as TitleNodeData;
  return (
    <div className="relative group" dir="rtl">
      <div
        className="px-8 py-5 rounded-2xl text-white text-center shadow-2xl min-w-[280px] border-2 border-white/20"
        style={{
          background: `linear-gradient(135deg, ${d.color}, ${d.color}dd)`,
          boxShadow: `0 20px 60px ${d.color}40`,
        }}
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <Sparkles className="h-5 w-5" />
          <h2 className="text-xl font-bold">{d.label}</h2>
        </div>
        <p className="text-white/80 text-xs max-w-[250px]">{d.description}</p>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!bg-transparent !border-0 !w-0 !h-0"
      />
    </div>
  );
});

// ─── Category Node (Main steps) ───────────────────────────────
export interface CategoryNodeData {
  label: string;
  description: string;
  order: number;
  hasChildren: boolean;
  hasResources: boolean;
  resourceCount: number;
  childCount: number;
  isCompleted: boolean;
  allChildrenCompleted: boolean;
  completedChildCount: number;
  color: string;
  isExpanded?: boolean;
  stepId?: string;
  onToggleStep?: (stepId: string) => void;
  linkedRoadmapSlug?: string;
  [key: string]: unknown;
}

export const CategoryNode = memo(function CategoryNode({
  data,
}: NodeProps) {
  const d = data as CategoryNodeData;
  const isLeaf = !d.hasChildren;

  return (
    <div className="relative group cursor-pointer" dir="rtl">
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!bg-transparent !border-0 !w-0 !h-0"
      />

      {/* Glow effect */}
      <div
        className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"
        style={{ background: `${d.color}30` }}
      />

      <div
        className={`relative px-6 py-4 rounded-xl min-w-[220px] max-w-[260px] border-2 transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-xl text-right ${
          d.allChildrenCompleted || d.isCompleted
            ? "bg-green-50 dark:bg-green-950/40 border-green-300 dark:border-green-700"
            : "bg-card border-border hover:border-primary/50"
        }`}
      >
        {/* Order badge */}
        <div
          className="absolute -top-3 -right-3 flex h-7 w-7 items-center justify-center rounded-full text-white text-xs font-bold shadow-lg"
          style={{ backgroundColor: d.color }}
        >
          {d.order}
        </div>

        {/* Checkbox: مراحل اصلی (با یا بدون زیرمراحل) */}
        {d.stepId && d.onToggleStep && (
          <button
            type="button"
            aria-label={(d.allChildrenCompleted || d.isCompleted) ? "بازگشت از تکمیل" : "تکمیل مرحله"}
            onClick={(e) => {
              e.stopPropagation();
              d.onToggleStep?.(d.stepId!);
            }}
            className="absolute top-3 right-3 left-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            style={{
              backgroundColor: (d.allChildrenCompleted || d.isCompleted) ? "var(--color-primary)" : "transparent",
              borderColor: (d.allChildrenCompleted || d.isCompleted) ? "var(--color-primary)" : "var(--color-border)",
            }}
          >
            {(d.allChildrenCompleted || d.isCompleted) && <Check className="h-3 w-3 text-primary-foreground stroke-[3]" />}
          </button>
        )}

        <h3 className={`font-bold text-sm leading-tight ${d.stepId ? "pr-8 pl-4" : "pr-5"}`}>{d.label}</h3>
        <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
          {d.description}
        </p>

        <div className="flex items-center justify-between mt-3 gap-2 min-h-[22px]">
          <div className="flex items-center gap-2">
            {d.linkedRoadmapSlug && (
              <Badge
                variant="secondary"
                className="text-[10px] gap-1 bg-primary/10 text-primary"
              >
                <ExternalLink className="h-3 w-3 shrink-0" />
                <span>نقشه راه</span>
              </Badge>
            )}
            {isLeaf ? (
              <Badge
                variant="secondary"
                className="text-[10px] gap-1.5 bg-primary/10 text-primary tabular-nums"
              >
                <BookOpen className="h-3 w-3 shrink-0" />
                <span>{d.resourceCount} منبع</span>
              </Badge>
            ) : (
              !d.linkedRoadmapSlug && (
                <Badge
                  variant="secondary"
                  className="text-[10px] gap-1 tabular-nums"
                >
                  {d.hasChildren && (
                    <>
                      {d.completedChildCount}/{d.childCount}
                    </>
                  )}
                </Badge>
              )
            )}
          </div>
          {d.hasChildren && !d.linkedRoadmapSlug && (
            <span className="text-[10px] text-muted-foreground">
              {d.isExpanded ? "▼ بستن" : "▶ باز کردن"}
            </span>
          )}
          {d.hasChildren && d.linkedRoadmapSlug && (
            <span className="text-[10px] text-muted-foreground">کلیک: باز کردن نقشه راه</span>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!bg-transparent !border-0 !w-0 !h-0"
      />
      {d.hasChildren && (
        <Handle
          type="source"
          position={Position.Bottom}
          id="children"
          className="!bg-transparent !border-0 !w-0 !h-0"
        />
      )}
    </div>
  );
});

// ─── Child Node (Sub-steps) ───────────────────────────────────
export interface ChildNodeData {
  label: string;
  description: string;
  resourceCount: number;
  isCompleted: boolean;
  parentColor: string;
  stepId?: string;
  onToggleStep?: (stepId: string) => void;
  linkedRoadmapSlug?: string;
  [key: string]: unknown;
}

export const ChildNode = memo(function ChildNode({ data }: NodeProps) {
  const d = data as ChildNodeData;

  return (
    <div className="relative group cursor-pointer" dir="rtl">
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-transparent !border-0 !w-0 !h-0"
      />

      {/* Glow */}
      <div
        className="absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"
        style={{ background: `${d.parentColor}25` }}
      />

      <div
        className={`relative px-6 py-4 rounded-xl min-w-[220px] max-w-[260px] border-2 transition-all duration-200 group-hover:scale-[1.02] group-hover:shadow-xl text-right ${
          d.isCompleted
            ? "bg-green-50 dark:bg-green-950/40 border-green-300 dark:border-green-700"
            : "bg-card border-border hover:border-primary/40"
        }`}
      >
        {/* Checkbox */}
        {d.stepId && d.onToggleStep && (
          <button
            type="button"
            aria-label={d.isCompleted ? "بازگشت از تکمیل" : "تکمیل مرحله"}
            onClick={(e) => {
              e.stopPropagation();
              d.onToggleStep?.(d.stepId!);
            }}
            className="absolute top-3 right-3 left-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 z-10"
            style={{
              backgroundColor: d.isCompleted ? "var(--color-primary)" : "transparent",
              borderColor: d.isCompleted ? "var(--color-primary)" : "var(--color-border)",
            }}
          >
            {d.isCompleted && <Check className="h-3 w-3 text-primary-foreground stroke-[3]" />}
          </button>
        )}

        <div className="flex items-start gap-3 flex-row-reverse">
          <div
            className="w-1.5 min-h-[3.25rem] rounded-full shrink-0 self-stretch"
            style={{ backgroundColor: d.parentColor }}
          />
          <div className="min-w-0 flex-1 py-0.5 pl-1 pr-8 text-right">
            <h4
              className={`font-bold text-sm leading-tight ${
                d.isCompleted ? "line-through text-muted-foreground" : ""
              }`}
            >
              {d.label}
            </h4>
            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
              {d.description}
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {d.linkedRoadmapSlug && (
                <span className="inline-flex items-center gap-1 text-[10px] text-primary">
                  <ExternalLink className="h-3 w-3" />
                  نقشه راه (کلیک برای باز کردن)
                </span>
              )}
              {d.resourceCount > 0 && (
                <>
                  <BookOpen className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">
                    {d.resourceCount} منبع
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export const nodeTypes = {
  titleNode: TitleNode,
  categoryNode: CategoryNode,
  childNode: ChildNode,
};
