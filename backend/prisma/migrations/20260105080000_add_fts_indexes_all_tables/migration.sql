-- Add generated column for full-text search on boards
ALTER TABLE "boards" ADD COLUMN IF NOT EXISTS "search_vector" tsvector 
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce("name", '')), 'A') ||
    setweight(to_tsvector('english', coalesce("description", '')), 'B')
  ) STORED;

-- Create GIN index for fast full-text search on boards
CREATE INDEX IF NOT EXISTS "boards_search_vector_idx" ON "boards" USING GIN ("search_vector");

-- Add generated column for full-text search on comments
ALTER TABLE "comments" ADD COLUMN IF NOT EXISTS "search_vector" tsvector 
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce("body", ''))
  ) STORED;

-- Create GIN index for fast full-text search on comments
CREATE INDEX IF NOT EXISTS "comments_search_vector_idx" ON "comments" USING GIN ("search_vector");

-- Add generated column for full-text search on users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "search_vector" tsvector 
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce("email", '')), 'A') ||
    setweight(to_tsvector('english', coalesce("nickname", '')), 'B')
  ) STORED;

-- Create GIN index for fast full-text search on users
CREATE INDEX IF NOT EXISTS "users_search_vector_idx" ON "users" USING GIN ("search_vector");

-- Add generated column for full-text search on reports
ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "search_vector" tsvector 
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce("reason", ''))
  ) STORED;

-- Create GIN index for fast full-text search on reports
CREATE INDEX IF NOT EXISTS "reports_search_vector_idx" ON "reports" USING GIN ("search_vector");

