import Link from "next/link";
import type { MDXComponents } from "mdx/types";

/** لینک زیبا به یک بلاگ دیگر همین سایت */
export function BlogRef({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  return (
    <Link
      href={`/blog/${slug}`}
      className="my-4 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 transition hover:border-primary/40 hover:bg-primary/10"
    >
      <span className="text-2xl">📖</span>
      <div className="flex-1">
        <span className="text-xs text-muted-foreground">مطلب مرتبط از بلاگ DevRoad</span>
        <p className="font-medium text-foreground">{title}</p>
      </div>
      <span className="text-muted-foreground">←</span>
    </Link>
  );
}

export function useMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    BlogRef,
    ...components,
  };
}
