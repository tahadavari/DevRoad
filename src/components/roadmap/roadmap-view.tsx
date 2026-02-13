"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import type { Roadmap, RoadmapStep, RoadmapCategory, RoadmapResource } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StepDialog } from "./step-dialog";
import { useAuthStore } from "@/lib/store";
import {
  FolderKanban,
  MessageSquare,
  PlayCircle,
  Check,
  Circle,
  ArrowUpRight,
  BookOpen,
  Minus,
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

    for (const category of roadmap.steps) {
      if (category.children?.length) {
        const incompleteChild = category.children.find((child) => !completedSteps.has(child.id));
        if (incompleteChild) return incompleteChild.id;
      } else if (!completedSteps.has(category.id)) {
        return category.id;
      }
    }

    return null;
  }, [user, isStarted, roadmap, completedSteps]);

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



  const recommendationStyles = {
    personal: {
      card: "border-violet-500/60 bg-violet-500/5",
      iconWrap: "bg-violet-500 text-white",
      icon: <Check className="h-3.5 w-3.5" />,
    },
    alternative: {
      card: "border-green-600/60 bg-green-600/5",
      iconWrap: "bg-green-600 text-white",
      icon: <Check className="h-3.5 w-3.5" />,
    },
    flexible: {
      card: "border-muted-foreground/60 bg-muted/40",
      iconWrap: "bg-muted-foreground text-white",
      icon: <Minus className="h-3.5 w-3.5" />,
    },
  } as const;

  const getRecommendationMarker = (
    recommendation?: "personal" | "alternative" | "flexible"
  ) => {
    if (!recommendation) return null;
    const style = recommendationStyles[recommendation];
    return (
      <span
        className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${style.iconWrap}`}
      >
        {style.icon}
      </span>
    );
  };

  const handleStepOpen = (step: ClickableStep) => {
    if (step.linkedRoadmapSlug) {
      window.location.href = `/roadmaps/${step.linkedRoadmapSlug}`;
      return;
    }

    if ((step.resources?.length ?? 0) === 0) return;

    setSelectedStep(step);
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
      <div className="mb-8 rounded-2xl border border-border/70 bg-card/70 p-6 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{roadmap.title}</h1>
            <p className="mt-2 text-muted-foreground leading-relaxed max-w-3xl">
              {roadmap.description}
            </p>
          </div>
          <div className="flex gap-2 shrink-0 flex-wrap">
            {!isStarted ? (
              <Button onClick={startRoadmap} className="gap-2">
                <PlayCircle className="h-4 w-4" />
                شروع مسیر
              </Button>
            ) : (
              <Badge variant="secondary" className="text-sm py-1.5 px-3 h-fit">
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

        {isStarted && (
          <div className="mt-6 max-w-2xl">
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

      <section className="relative rounded-2xl border border-border/70 bg-background/90 p-4 sm:p-6">
        <div className="mb-5 flex items-center gap-2 text-sm text-muted-foreground">
          <BookOpen className="h-4 w-4" />
          نقشه‌راه مرحله به مرحله (الهام گرفته از roadmap.sh)
        </div>

        <div className="mb-5 inline-flex flex-col gap-2 rounded-xl border-2 border-foreground/80 bg-card px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2.5 text-sm font-medium text-foreground">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 text-white">
              <Check className="h-3.5 w-3.5" />
            </span>
            توصیه می‌شود
          </div>
          <div className="flex items-center gap-2.5 text-sm font-medium text-foreground">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-white">
              <Check className="h-3.5 w-3.5" />
            </span>
            جایگزین
          </div>
          <div className="flex items-center gap-2.5 text-sm font-medium text-foreground">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted-foreground text-white">
              <Minus className="h-3.5 w-3.5" />
            </span>
            در صورت علاقه
          </div>
        </div>

        <div className="space-y-5">
          {roadmap.steps.map((category, index) => {
            const hasChildren = !!category.children?.length;
            const isCategoryDone = hasChildren
              ? category.children!.every((child) => completedSteps.has(child.id))
              : completedSteps.has(category.id);

            return (
              <div key={category.id} className="relative">
                {index !== roadmap.steps.length - 1 && (
                  <div className="absolute right-6 top-12 h-[calc(100%+1.25rem)] w-px bg-border" />
                )}

                <div className={`relative overflow-hidden rounded-xl border bg-card ${category.recommendation ? recommendationStyles[category.recommendation].card : "border-border/70"}`}>
                  <div className="flex items-start justify-between gap-3 border-b border-border/60 p-4">
                    <button
                      type="button"
                      onClick={() =>
                        handleStepOpen({
                          ...category,
                          resources: category.resources ?? [],
                        })
                      }
                      className="text-right"
                    >
                      <p className="text-xs text-muted-foreground">مرحله {index + 1}</p>
                      <h2 className="text-lg font-semibold hover:text-primary transition-colors">
                        {category.title}
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {category.description}
                      </p>
                    </button>

                    <div className="flex items-center gap-2">
                      {getRecommendationMarker(category.recommendation)}
                      {category.linkedRoadmapSlug && (
                        <button
                          type="button"
                          onClick={() => handleStepOpen({ ...category, resources: category.resources ?? [] })}
                          className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-xs text-primary hover:bg-primary/15"
                          title="باز کردن نقشه‌راه مرتبط"
                        >
                          <ArrowUpRight className="h-3.5 w-3.5" />
                          <span>رفتن به مسیر</span>
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={!isStarted || (!user && !isStarted)}
                        onClick={() => toggleStep(category.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
                        title={isStarted ? "تغییر وضعیت تکمیل" : "ابتدا مسیر را شروع کنید"}
                      >
                        {isCategoryDone ? <Check className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {hasChildren && (
                    <div className="grid gap-3 p-4 sm:grid-cols-2">
                      {category.children!.map((step, childIndex) => {
                        const isDone = completedSteps.has(step.id);
                        const isCurrent = currentStepId === step.id;
                        const uniqueKey = `${category.id}-${step.id}-${childIndex}`;

                        return (
                          <div
                            key={uniqueKey}
                            className={`rounded-lg border p-3 transition-colors ${
                              step.recommendation
                                ? recommendationStyles[step.recommendation].card
                                : isCurrent
                                  ? "border-primary/60 bg-primary/5"
                                  : "border-border/70 hover:border-primary/40"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2">
                                {getRecommendationMarker(step.recommendation)}
                              <button
                                type="button"
                                className="text-right"
                                onClick={() => handleStepOpen(step)}
                              >
                                <h3 className="font-medium leading-snug hover:text-primary transition-colors">
                                  {step.title}
                                </h3>
                                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                                  {step.description}
                                </p>
                              </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => toggleStep(step.id)}
                                disabled={!isStarted || (!user && !isStarted)}
                                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                {isDone ? <Check className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                              </button>
                            </div>
                            {isCurrent && (
                              <Badge variant="default" className="mt-2 text-[10px]">
                                مرحله فعلی
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

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
