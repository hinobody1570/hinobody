-- CreateTable
CREATE TABLE "eye_masked_images" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "size" INTEGER,
    "mimeType" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eye_masked_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "eye_masked_images_userId_idx" ON "eye_masked_images"("userId");

-- CreateIndex
CREATE INDEX "eye_masked_images_createdAt_idx" ON "eye_masked_images"("createdAt");

-- AddForeignKey
ALTER TABLE "eye_masked_images" ADD CONSTRAINT "eye_masked_images_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

