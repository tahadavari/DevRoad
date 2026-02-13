-- CreateEnum
CREATE TYPE "ForumContentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "forum_questions" ADD COLUMN "status" "ForumContentStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "forum_answers" ADD COLUMN "status" "ForumContentStatus" NOT NULL DEFAULT 'PENDING';
