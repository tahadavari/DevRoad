"use client";

import { memo } from "react";
import {
  BaseEdge,
  getSmoothStepPath,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";

// ─── Main edge (between categories, horizontal) ───────────────
export const MainEdge = memo(function MainEdge(props: EdgeProps) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style,
  } = props;

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 16,
  });

  const gradientId = `mainEdgeGradient-${id ?? Math.random().toString(36)}`;

  return (
    <>
      <defs>
        <linearGradient
          id={gradientId}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
          <stop offset="100%" stopColor="#6366f1" stopOpacity={0.3} />
        </linearGradient>
      </defs>
      <BaseEdge
        path={edgePath}
        style={{
          ...style,
          stroke: `url(#${gradientId})`,
          strokeWidth: 3,
          strokeDasharray: "8,4",
          animation: "dashmove 1.5s linear infinite",
        }}
      />
    </>
  );
});

// ─── Branch edge (category → child) ──────────────────────────
export const BranchEdge = memo(function BranchEdge(props: EdgeProps) {
  const {
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style,
    data,
  } = props;

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    curvature: 0.4,
  });

  const color = (data as { color?: string })?.color || "var(--color-primary)";

  return (
    <BaseEdge
      path={edgePath}
      style={{
        ...style,
        stroke: color,
        strokeWidth: 2,
        strokeOpacity: 0.4,
      }}
    />
  );
});

export const edgeTypes = {
  mainEdge: MainEdge,
  branchEdge: BranchEdge,
};
