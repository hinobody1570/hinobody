-- CreateEnum (only if it doesn't exist)
DO $$ BEGIN
    CREATE TYPE "BoardMemberStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add creatorId column as nullable first to handle existing data (only if table exists and column doesn't)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'boards') THEN
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'boards' AND column_name = 'creatorId') THEN
            ALTER TABLE "boards" ADD COLUMN "creatorId" TEXT;
        END IF;
    END IF;
END $$;

-- Set default creatorId for existing boards (only if both tables exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'boards') THEN
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
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
        END IF;

        -- Make creatorId NOT NULL (only if column exists)
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'boards' AND column_name = 'creatorId') THEN
            ALTER TABLE "boards" ALTER COLUMN "creatorId" SET NOT NULL;
        END IF;
    END IF;
END $$;

-- Add foreign key constraint (only if both tables and column exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'boards') THEN
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
            IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'boards' AND column_name = 'creatorId') THEN
                IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE table_schema = 'public' AND table_name = 'boards' AND constraint_name = 'boards_creatorId_fkey') THEN
                    ALTER TABLE "boards" ADD CONSTRAINT "boards_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
                END IF;
            END IF;
        END IF;
    END IF;
END $$;

-- Create index on creatorId (only if table exists and index doesn't)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'boards') THEN
        IF NOT EXISTS (SELECT FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'boards' AND indexname = 'boards_creatorId_idx') THEN
            CREATE INDEX "boards_creatorId_idx" ON "boards"("creatorId");
        END IF;
    END IF;
END $$;

-- CreateTable for board_members (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS "board_members" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "status" "BoardMemberStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "board_members_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint for userId and boardId combination (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'board_members' AND indexname = 'board_members_userId_boardId_key') THEN
        CREATE UNIQUE INDEX "board_members_userId_boardId_key" ON "board_members"("userId", "boardId");
    END IF;
END $$;

-- Create indexes (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'board_members' AND indexname = 'board_members_boardId_idx') THEN
        CREATE INDEX "board_members_boardId_idx" ON "board_members"("boardId");
    END IF;
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'board_members' AND indexname = 'board_members_userId_idx') THEN
        CREATE INDEX "board_members_userId_idx" ON "board_members"("userId");
    END IF;
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'board_members' AND indexname = 'board_members_status_idx') THEN
        CREATE INDEX "board_members_status_idx" ON "board_members"("status");
    END IF;
END $$;

-- Add foreign key constraints (only if they don't exist and referenced tables exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'board_members') THEN
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
            IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE table_schema = 'public' AND table_name = 'board_members' AND constraint_name = 'board_members_userId_fkey') THEN
                ALTER TABLE "board_members" ADD CONSTRAINT "board_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
            END IF;
        END IF;
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'boards') THEN
            IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE table_schema = 'public' AND table_name = 'board_members' AND constraint_name = 'board_members_boardId_fkey') THEN
                ALTER TABLE "board_members" ADD CONSTRAINT "board_members_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
            END IF;
        END IF;
    END IF;
END $$;

-- Auto-approve existing board creators as members (only if both tables exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'boards') THEN
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'board_members') THEN
            IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'boards' AND column_name = 'creatorId') THEN
                INSERT INTO "board_members" ("id", "userId", "boardId", "status", "createdAt", "updatedAt")
                SELECT 
                    gen_random_uuid()::TEXT AS "id",
                    "creatorId" AS "userId",
                    "id" AS "boardId",
                    'APPROVED' AS "status",
                    "createdAt" AS "createdAt",
                    "updatedAt" AS "updatedAt"
                FROM "boards"
                ON CONFLICT ("userId", "boardId") DO NOTHING;
            END IF;
        END IF;
    END IF;
END $$;

