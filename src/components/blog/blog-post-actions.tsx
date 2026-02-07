"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";

export function BlogPostActions({ blogSlug }: { blogSlug: string }) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasUser, setHasUser] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setHasUser(!!(d.success && d.data)));
    fetch("/api/blog/bookmarks")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.data)) {
          setIsBookmarked(d.data.some((b: { blogSlug: string }) => b.blogSlug === blogSlug));
        }
      })
      .catch(() => {});
  }, [blogSlug]);

  const toggleBookmark = async () => {
    if (!hasUser) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/blog/${blogSlug}/bookmark`, { method: "POST" });
      const data = await res.json();
      if (data.success) setIsBookmarked(!!data.data?.bookmarked);
    } finally {
      setLoading(false);
    }
  };

  if (!hasUser) return null;

  return (
    <div className="mt-2">
      <Button
        variant="outline"
        size="sm"
        onClick={toggleBookmark}
        disabled={loading}
      >
        {isBookmarked ? (
          <>
            <BookmarkCheck className="h-4 w-4" />
            ذخیره شده
          </>
        ) : (
          <>
            <Bookmark className="h-4 w-4" />
            ذخیره برای بعد
          </>
        )}
      </Button>
    </div>
  );
}
