/*
  Warnings:

  - Added the required column `email` to the `Quote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `message` to the `Quote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Quote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Quote` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Quote" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "message" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "vehicleType" DROP NOT NULL,
ALTER COLUMN "origin" DROP NOT NULL,
ALTER COLUMN "destination" DROP NOT NULL;
