"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import type { Roadmap, RoadmapStep, RoadmapCategory, RoadmapResource } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StepDialog } from "./step-dialog";
import { RoadmapFlow, getFirstIncompleteStepId } from "./flow/roadmap-flow";
import { useAuthStore } from "@/lib/store";
import {
  FolderKanban,
  MessageSquare,
  PlayCircle,
} from "lucide-react";

type ClickableStep = RoadmapStep | (RoadmapCategory & { resources: RoadmapResource[] });

export function RoadmapView({ roadmap }: { roadmap: Roadmap }) {
  const { user } = useAuthStore();
  const [selectedStep, setSelectedStep] = useState<ClickableStep | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isStarted, setIsStarted] = useState(false);

  const totalSteps = roadmap.steps.reduce((sum, cat) => {
    const childCount = cat.children?.length ?? 0;
    return sum + (childCount > 0 ? childCount : 1);
  }, 0);
  const progressPercent =
    totalSteps > 0 ? (completedSteps.size / totalSteps) * 100 : 0;

  const currentStepId = useMemo(() => {
    if (!user || !isStarted) return null;
    return getFirstIncompleteStepId(roadmap, completedSteps);
  }, [user, isStarted, roadmap, completedSteps]);

  // Load user progress
  useEffect(() => {
    if (user) {
      fetch(`/api/progress?roadmapSlug=${roadmap.slug}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data?.length > 0) {
            setIsStarted(true);
            setCompletedSteps(
              new Set(data.data.map((p: { stepId: string }) => p.stepId))
            );
          }
        })
        .catch(() => {});
    }
  }, [user, roadmap.slug]);

  const toggleStep = async (stepId: string) => {
    const category = roadmap.steps.find((s) => s.id === stepId);
    const childIds = category?.children?.map((c) => c.id) ?? [];
    const idsToToggle = [stepId, ...childIds];

    const next = new Set(completedSteps);
    const completing = !next.has(stepId);
    for (const id of idsToToggle) {
      if (completing) next.add(id);
      else next.delete(id);
    }
    setCompletedSteps(next);

    if (!user || !isStarted) return;
    try {
      await Promise.all(
        idsToToggle.map((id) =>
          fetch("/api/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              roadmapSlug: roadmap.slug,
              stepId: id,
              completed: completing,
            }),
          })
        )
      );
    } catch {
      const revert = new Set(completedSteps);
      for (const id of idsToToggle) {
        if (completing) revert.delete(id);
        else revert.add(id);
      }
      setCompletedSteps(revert);
    }
  };

  const startRoadmap = async () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    try {
      const res = await fetch("/api/roadmaps/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roadmapSlug: roadmap.slug }),
      });
      if (res.ok) {
        setIsStarted(true);
        const progressRes = await fetch(
          `/api/progress?roadmapSlug=${roadmap.slug}`
        );
        if (progressRes.ok) {
          const data = await progressRes.json();
          if (data.success) {
            setCompletedSteps(
              new Set(data.data.map((p: { stepId: string }) => p.stepId))
            );
          }
        }
      }
    } catch {
      // Ignore
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{roadmap.title}</h1>
            <p className="mt-2 text-muted-foreground leading-relaxed max-w-2xl">
              {roadmap.description}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            {!isStarted ? (
              <Button onClick={startRoadmap} className="gap-2">
                <PlayCircle className="h-4 w-4" />
                شروع مسیر
              </Button>
            ) : (
              <Badge variant="secondary" className="text-sm py-1.5 px-3">
                در حال یادگیری
              </Badge>
            )}
            <Link href={`/roadmaps/${roadmap.slug}/projects`}>
              <Button variant="outline" className="gap-2">
                <FolderKanban className="h-4 w-4" />
                پروژه‌ها
              </Button>
            </Link>
            <Link href={`/forum/${roadmap.slug}`}>
              <Button variant="outline" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                فوروم
              </Button>
            </Link>
          </div>
        </div>

        {/* Progress bar */}
        {isStarted && (
          <div className="mt-6 max-w-xl">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">پیشرفت شما</span>
              <span className="font-medium">
                {completedSteps.size} از {totalSteps} مرحله
              </span>
            </div>
            <Progress value={progressPercent} />
          </div>
        )}
      </div>

      {/* React Flow Roadmap */}
      <RoadmapFlow
        roadmap={roadmap}
        completedSteps={completedSteps}
        isLoggedIn={!!user && isStarted}
        currentStepId={currentStepId}
        onStepClick={(step) => setSelectedStep(step)}
        onToggleStep={toggleStep}
      />

      {/* Hint */}
      <p className="text-xs text-muted-foreground text-center mt-3">
        روی هر مرحله کلیک کنید تا زیرمراحل باز شود یا منابع را ببینید. با چک‌باکس تکمیل را علامت بزنید. نودها را می‌توانید جابجا کنید.
      </p>

      {/* Step Detail Dialog */}
      {selectedStep && (
        <StepDialog
          step={selectedStep}
          open={!!selectedStep}
          onClose={() => setSelectedStep(null)}
        />
      )}
    </div>
  );
}
