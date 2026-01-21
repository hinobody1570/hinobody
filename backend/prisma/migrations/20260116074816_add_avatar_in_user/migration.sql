/*
  Warnings:

  - You are about to drop the column `search_vector` on the `boards` table. All the data in the column will be lost.
  - You are about to drop the column `search_vector` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `search_vector` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `search_vector` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the column `search_vector` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "boards_search_vector_idx";

-- DropIndex
DROP INDEX "comments_search_vector_idx";

-- DropIndex
DROP INDEX "posts_search_vector_idx";

-- DropIndex
DROP INDEX "reports_search_vector_idx";

-- DropIndex
DROP INDEX "users_search_vector_idx";

-- AlterTable
ALTER TABLE "boards" DROP COLUMN "search_vector";

-- AlterTable
ALTER TABLE "comments" DROP COLUMN "search_vector";

-- AlterTable
ALTER TABLE "posts" DROP COLUMN "search_vector";

-- AlterTable
ALTER TABLE "reports" DROP COLUMN "search_vector";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "search_vector",
ADD COLUMN     "avatar" TEXT;
