export async function register() {
  // Only run on server-side
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { prisma } = await import("@/lib/prisma");
    const { getRoadmapIndex } = await import("@/lib/roadmap");

    try {
      const index = getRoadmapIndex();

      for (const roadmap of index.roadmaps) {
        const existingForum = await prisma.forum.findUnique({
          where: { roadmapSlug: roadmap.slug },
        });

        if (!existingForum) {
          await prisma.forum.create({
            data: {
              roadmapSlug: roadmap.slug,
              title: `فوروم ${roadmap.title}`,
            },
          });
          console.log(`[Startup] Created forum for roadmap: ${roadmap.slug}`);
        }
      }
    } catch (error) {
      // Database might not be ready yet during build
      console.log("[Startup] Could not sync forums (database may not be ready):", error instanceof Error ? error.message : "unknown error");
    }
  }
}
