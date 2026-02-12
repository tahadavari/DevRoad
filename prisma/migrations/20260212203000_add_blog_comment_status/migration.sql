-- CreateEnum
CREATE TYPE "CommentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "blog_comments"
ADD COLUMN "status" "CommentStatus" NOT NULL DEFAULT 'PENDING';
