"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface MentorItem {
  id: string;
  firstName: string;
  lastName: string;
}

interface MentorListProps {
  mentors: MentorItem[];
  selectedId: string | null;
  onSelect: (mentor: MentorItem) => void;
  loading?: boolean;
}

export function MentorList({ mentors, selectedId, onSelect, loading }: MentorListProps) {
  if (loading) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        در حال بارگذاری...
      </div>
    );
  }
  if (mentors.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        منتوری یافت نشد.
      </div>
    );
  }
  return (
    <ul className="divide-y">
      {mentors.map((m) => (
        <li key={m.id}>
          <button
            type="button"
            className={cn(
              "flex w-full items-center gap-3 px-4 py-3 text-right transition-colors hover:bg-muted/50",
              selectedId === m.id && "bg-muted"
            )}
            onClick={() => onSelect(m)}
          >
            <Avatar className="h-10 w-10">
              <AvatarFallback className="text-sm">
                {m.firstName[0]}
                {m.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">
              {m.firstName} {m.lastName}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
