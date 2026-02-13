"use client";

import type { RoadmapResource } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  getResourceTypeLabel,
  getResourceTypeColor,
} from "@/lib/utils";
import {
  ExternalLink,
  Clock,
  Globe,
  DollarSign,
  BookOpen,
} from "lucide-react";

interface StepDialogProps {
  step: {
    id: string;
    title: string;
    description: string;
    resources?: RoadmapResource[];
  };
  open: boolean;
  onClose: () => void;
}

const SEARCH_RESOURCE_TYPES = ["search", "playlist", "playlist-search"];

function isSearchTypeResource(type: string) {
  return SEARCH_RESOURCE_TYPES.includes(type);
}

function ResourceCard({
  resource,
  index,
}: {
  resource: RoadmapResource;
  index: number;
}) {
  return (
    <div
      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <Badge
              className={getResourceTypeColor(resource.type)}
              variant="secondary"
            >
              {getResourceTypeLabel(resource.type)}
            </Badge>
            {(resource.price ?? "free") === "free" ? (
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
              >
                رایگان
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
              >
                <DollarSign className="h-3 w-3 ml-1" />
                {(resource.priceAmount ?? 0) > 0
                  ? `$${resource.priceAmount}`
                  : "پولی"}
              </Badge>
            )}
            {resource.language != null && (
              <Badge variant="outline" className="text-[10px]">
                {resource.language === "fa" ? "فارسی" : "انگلیسی"}
              </Badge>
            )}
          </div>
          <h4 className="font-medium text-sm">{resource.title}</h4>
          {resource.description != null && resource.description !== "" && (
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {resource.description}
            </p>
          )}
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            {resource.duration != null && resource.duration !== "" && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {resource.duration}
              </span>
            )}
            {resource.language != null && (
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {resource.language === "fa" ? "فارسی" : "انگلیسی"}
              </span>
            )}
          </div>
        </div>
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0"
        >
          <Button variant="outline" size="sm" className="gap-1">
            <ExternalLink className="h-3 w-3" />
            مشاهده
          </Button>
        </a>
      </div>
    </div>
  );
}

export function StepDialog({ step, open, onClose }: StepDialogProps) {
  const resources = step.resources || [];
  const mainResources = resources.filter((r) => !isSearchTypeResource(r.type));
  const searchResources = resources.filter((r) => isSearchTypeResource(r.type));
  const hasAnyResources = resources.length > 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogClose onClick={onClose} />
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {step.title}
          </DialogTitle>
          <DialogDescription className="leading-relaxed text-sm">
            {step.description}
          </DialogDescription>
        </DialogHeader>

        {hasAnyResources && (
          <>
            <Separator />
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <span>منابع پیشنهادی</span>
                <Badge variant="secondary" className="text-xs">
                  {resources.length} منبع
                </Badge>
              </h3>
              <div className="space-y-3">
                {mainResources.map((resource, index) => (
                  <ResourceCard key={index} resource={resource} index={index} />
                ))}
              </div>
              {searchResources.length > 0 && (
                <details className="mt-4 rounded-lg border border-border bg-muted/30">
                  <summary className="cursor-pointer list-none rounded-lg p-3 font-medium text-sm hover:bg-muted/50 transition-colors flex items-center gap-2">
                    <span>منابع جستجو و پلی‌لیست</span>
                    <Badge variant="secondary" className="text-xs">
                      {searchResources.length} منبع
                    </Badge>
                  </summary>
                  <div className="border-t border-border p-3 space-y-3">
                    {searchResources.map((resource, index) => (
                      <ResourceCard key={index} resource={resource} index={index} />
                    ))}
                  </div>
                </details>
              )}
            </div>
          </>
        )}

        {!hasAnyResources && (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p>هنوز منبعی برای این مرحله اضافه نشده</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
