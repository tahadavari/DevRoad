-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'MENTOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "VoteType" AS ENUM ('LIKE', 'DISLIKE');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('ANSWER_RECEIVED', 'ANSWER_ACCEPTED', 'ROLE_UPGRADED', 'SYSTEM');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_codes" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roadmaps" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roadmapSlug" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roadmaps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roadmapSlug" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT true,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roadmapSlug" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "repoUrl" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_feedbacks" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forums" (
    "id" TEXT NOT NULL,
    "roadmapSlug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_questions" (
    "id" TEXT NOT NULL,
    "forumId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forum_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_answers" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isAccepted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forum_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answer_votes" (
    "id" TEXT NOT NULL,
    "answerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "VoteType" NOT NULL,

    CONSTRAINT "answer_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "type" "MessageType" NOT NULL,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_roadmaps_userId_roadmapSlug_key" ON "user_roadmaps"("userId", "roadmapSlug");

-- CreateIndex
CREATE UNIQUE INDEX "user_progress_userId_roadmapSlug_stepId_key" ON "user_progress"("userId", "roadmapSlug", "stepId");

-- CreateIndex
CREATE UNIQUE INDEX "projects_userId_roadmapSlug_projectId_key" ON "projects"("userId", "roadmapSlug", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "forums_roadmapSlug_key" ON "forums"("roadmapSlug");

-- CreateIndex
CREATE UNIQUE INDEX "answer_votes_answerId_userId_key" ON "answer_votes"("answerId", "userId");

-- AddForeignKey
ALTER TABLE "verification_codes" ADD CONSTRAINT "verification_codes_email_fkey" FOREIGN KEY ("email") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roadmaps" ADD CONSTRAINT "user_roadmaps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_feedbacks" ADD CONSTRAINT "project_feedbacks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_feedbacks" ADD CONSTRAINT "project_feedbacks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_questions" ADD CONSTRAINT "forum_questions_forumId_fkey" FOREIGN KEY ("forumId") REFERENCES "forums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_questions" ADD CONSTRAINT "forum_questions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_answers" ADD CONSTRAINT "forum_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "forum_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_answers" ADD CONSTRAINT "forum_answers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer_votes" ADD CONSTRAINT "answer_votes_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "forum_answers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer_votes" ADD CONSTRAINT "answer_votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
