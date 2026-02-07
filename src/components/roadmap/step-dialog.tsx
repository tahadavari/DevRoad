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

export function StepDialog({ step, open, onClose }: StepDialogProps) {
  const resources = step.resources || [];

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

        {resources.length > 0 && (
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
                {resources.map((resource, index) => (
                  <div
                    key={index}
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
                          {resource.price === "free" ? (
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
                              {resource.priceAmount > 0
                                ? `$${resource.priceAmount}`
                                : "پولی"}
                            </Badge>
                          )}
                          {resource.language && (
                            <Badge variant="outline" className="text-[10px]">
                              {resource.language === "fa" ? "فارسی" : "انگلیسی"}
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-medium text-sm">{resource.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {resource.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {resource.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {resource.language === "fa" ? "فارسی" : "انگلیسی"}
                          </span>
                        </div>
                      </div>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          مشاهده
                        </Button>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {resources.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p>هنوز منبعی برای این مرحله اضافه نشده</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
