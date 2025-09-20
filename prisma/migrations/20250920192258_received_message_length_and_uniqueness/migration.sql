/*
  Warnings:

  - You are about to alter the column `content` on the `received_messages` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(1000)`.
  - A unique constraint covering the columns `[userId,content]` on the table `received_messages` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."received_messages" ALTER COLUMN "content" SET DATA TYPE VARCHAR(1000);

-- CreateIndex
CREATE UNIQUE INDEX "received_messages_userId_content_key" ON "public"."received_messages"("userId", "content");
