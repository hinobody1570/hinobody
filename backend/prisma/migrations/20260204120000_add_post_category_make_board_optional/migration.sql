-- AlterTable
-- Add postCategory column (optional)
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "postCategory" TEXT;

-- Make boardId optional: first drop NOT NULL constraint, then allow NULL
ALTER TABLE "posts" ALTER COLUMN "boardId" DROP NOT NULL;
