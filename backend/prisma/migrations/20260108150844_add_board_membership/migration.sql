-- CreateEnum
CREATE TYPE "BoardMemberStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- Add creatorId column as nullable first to handle existing data
ALTER TABLE "boards" ADD COLUMN "creatorId" TEXT;

-- Set default creatorId for existing boards
-- First, try to find an admin user, if none exists, use the first user
UPDATE "boards" 
SET "creatorId" = (
  SELECT "id" 
  FROM "users" 
  WHERE "role" = 'ADMIN' 
  ORDER BY "createdAt" ASC 
  LIMIT 1
)
WHERE "creatorId" IS NULL;

-- If still null (no admin exists), use the first user
UPDATE "boards" 
SET "creatorId" = (
  SELECT "id" 
  FROM "users" 
  ORDER BY "createdAt" ASC 
  LIMIT 1
)
WHERE "creatorId" IS NULL;

-- Make creatorId NOT NULL
ALTER TABLE "boards" ALTER COLUMN "creatorId" SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE "boards" ADD CONSTRAINT "boards_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create index on creatorId
CREATE INDEX "boards_creatorId_idx" ON "boards"("creatorId");

-- CreateTable for board_members
CREATE TABLE "board_members" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "status" "BoardMemberStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "board_members_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint for userId and boardId combination
CREATE UNIQUE INDEX "board_members_userId_boardId_key" ON "board_members"("userId", "boardId");

-- Create indexes
CREATE INDEX "board_members_boardId_idx" ON "board_members"("boardId");
CREATE INDEX "board_members_userId_idx" ON "board_members"("userId");
CREATE INDEX "board_members_status_idx" ON "board_members"("status");

-- Add foreign key constraints
ALTER TABLE "board_members" ADD CONSTRAINT "board_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "board_members" ADD CONSTRAINT "board_members_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Auto-approve existing board creators as members
-- Using md5 hash with random() for UUID generation (compatible with all PostgreSQL versions)
INSERT INTO "board_members" ("id", "userId", "boardId", "status", "createdAt", "updatedAt")
SELECT 
    md5(random()::text || clock_timestamp()::text)::uuid::text AS "id",
    "creatorId" AS "userId",
    "id" AS "boardId",
    'APPROVED' AS "status",
    "createdAt" AS "createdAt",
    "updatedAt" AS "updatedAt"
FROM "boards"
ON CONFLICT ("userId", "boardId") DO NOTHING;

