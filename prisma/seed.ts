import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create forums for each roadmap
  const indexPath = path.join(process.cwd(), "data", "roadmaps", "index.json");
  const indexData = JSON.parse(fs.readFileSync(indexPath, "utf-8"));

  for (const roadmap of indexData.roadmaps) {
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
      console.log(`Created forum for roadmap: ${roadmap.slug}`);
    } else {
      console.log(`Forum already exists for roadmap: ${roadmap.slug}`);
    }
  }

  // Create admin user if not exists
  const adminEmail = "admin@devroad.ir";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123456", 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        firstName: "ادمین",
        lastName: "DevRoad",
        password: hashedPassword,
        role: "ADMIN",
        emailVerified: true,
      },
    });
    console.log("Created admin user: admin@devroad.ir / admin123456");
  } else {
    console.log("Admin user already exists");
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    // Don't exit with error code - allow deployment to continue
    // process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
