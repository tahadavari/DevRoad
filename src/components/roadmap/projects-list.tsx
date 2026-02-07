"use client";

import { useState } from "react";
import type { RoadmapProject } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getLevelLabel, getLevelColor } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";
import {
  Github,
  Eye,
  EyeOff,
  CheckCircle2,
  Send,
} from "lucide-react";

export function ProjectsList({
  projects,
  roadmapSlug,
}: {
  projects: RoadmapProject[];
  roadmapSlug: string;
}) {
  const { user } = useAuthStore();
  const [submissions, setSubmissions] = useState<
    Record<string, { repoUrl: string; isPublic: boolean }>
  >({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  const levels = ["beginner", "intermediate", "advanced"] as const;

  const handleSubmit = async (projectId: string) => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    const submission = submissions[projectId];
    if (!submission?.repoUrl) return;

    setSubmitting(projectId);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roadmapSlug,
          projectId,
          repoUrl: submission.repoUrl,
          isPublic: submission.isPublic,
        }),
      });
      if (res.ok) {
        alert("پروژه با موفقیت ثبت شد!");
      }
    } catch {
      alert("خطا در ثبت پروژه");
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="space-y-10">
      {levels.map((level) => {
        const levelProjects = projects.filter((p) => p.level === level);
        if (levelProjects.length === 0) return null;
        return (
          <div key={level}>
            <div className="flex items-center gap-3 mb-4">
              <Badge className={getLevelColor(level)} variant="secondary">
                {getLevelLabel(level)}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {levelProjects.length} پروژه
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {levelProjects.map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <CardDescription className="leading-relaxed">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">الزامات:</h4>
                      <ul className="space-y-1">
                        {project.requirements.map((req, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-2 text-sm text-muted-foreground"
                          >
                            <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Submit form */}
                    <div className="border-t pt-4 space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">لینک ریپوزیتوری</Label>
                        <div className="flex gap-2">
                          <Input
                            dir="ltr"
                            placeholder="https://github.com/username/repo"
                            value={submissions[project.id]?.repoUrl || ""}
                            onChange={(e) =>
                              setSubmissions((prev) => ({
                                ...prev,
                                [project.id]: {
                                  ...prev[project.id],
                                  repoUrl: e.target.value,
                                  isPublic:
                                    prev[project.id]?.isPublic ?? false,
                                },
                              }))
                            }
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <button
                          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() =>
                            setSubmissions((prev) => ({
                              ...prev,
                              [project.id]: {
                                ...prev[project.id],
                                repoUrl: prev[project.id]?.repoUrl || "",
                                isPublic: !prev[project.id]?.isPublic,
                              },
                            }))
                          }
                        >
                          {submissions[project.id]?.isPublic ? (
                            <>
                              <Eye className="h-3 w-3" /> عمومی
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3" /> خصوصی
                            </>
                          )}
                        </button>
                        <Button
                          size="sm"
                          className="gap-1"
                          disabled={submitting === project.id}
                          onClick={() => handleSubmit(project.id)}
                        >
                          <Send className="h-3 w-3" />
                          {submitting === project.id
                            ? "در حال ارسال..."
                            : "ثبت پروژه"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
