-- CreateTable: board_categories
CREATE TABLE "board_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "board_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: unique name constraint
CREATE UNIQUE INDEX "board_categories_name_key" ON "board_categories"("name");

-- Migrate existing category values to board_categories
-- First, insert unique categories from existing boards
INSERT INTO "board_categories" ("id", "name", "active", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text as "id",
    "category" as "name",
    true as "active",
    NOW() as "createdAt",
    NOW() as "updatedAt"
FROM (SELECT DISTINCT "category" FROM "boards" WHERE "category" IS NOT NULL) AS unique_categories;

-- Add categoryId column (nullable first)
ALTER TABLE "boards" ADD COLUMN "categoryId" TEXT;

-- Update boards to reference the correct categoryId
UPDATE "boards" b
SET "categoryId" = bc."id"
FROM "board_categories" bc
WHERE b."category" = bc."name";

-- Make categoryId NOT NULL
ALTER TABLE "boards" ALTER COLUMN "categoryId" SET NOT NULL;

-- CreateIndex: index on categoryId
CREATE INDEX "boards_categoryId_idx" ON "boards"("categoryId");

-- AddForeignKey: boards.categoryId -> board_categories.id
ALTER TABLE "boards" ADD CONSTRAINT "boards_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "board_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Drop the old category column
ALTER TABLE "boards" DROP COLUMN "category";
