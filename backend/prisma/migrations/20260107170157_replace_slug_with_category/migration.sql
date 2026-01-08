-- Add category column (nullable first to handle existing data)
ALTER TABLE "boards" ADD COLUMN "category" TEXT;

-- Set default category for existing rows (you can customize this based on your needs)
-- For now, setting a default "general" category for all existing boards
UPDATE "boards" SET "category" = 'general' WHERE "category" IS NULL;

-- Make category NOT NULL
ALTER TABLE "boards" ALTER COLUMN "category" SET NOT NULL;

-- Drop the unique constraint on slug
ALTER TABLE "boards" DROP CONSTRAINT IF EXISTS "boards_slug_key";

-- Drop the slug column
ALTER TABLE "boards" DROP COLUMN "slug";

