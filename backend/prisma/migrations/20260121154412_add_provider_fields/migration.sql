-- CreateEnum
DO $$ BEGIN
 CREATE TYPE "AuthProvider" AS ENUM('LOCAL', 'GOOGLE', 'APPLE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- AlterTable
ALTER TABLE "users" 
ALTER COLUMN "passwordHash" DROP NOT NULL,
ADD COLUMN IF NOT EXISTS "provider" "AuthProvider" DEFAULT 'LOCAL',
ADD COLUMN IF NOT EXISTS "providerId" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "users_provider_providerId_idx" ON "users"("provider", "providerId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_provider_providerId_key" ON "users"("provider", "providerId");

