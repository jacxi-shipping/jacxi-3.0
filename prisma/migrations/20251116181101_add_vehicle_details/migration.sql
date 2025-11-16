-- CreateEnum
CREATE TYPE "TitleStatus" AS ENUM ('PENDING', 'DELIVERED');

-- AlterTable
ALTER TABLE "Shipment" ADD COLUMN     "hasKey" BOOLEAN,
ADD COLUMN     "hasTitle" BOOLEAN,
ADD COLUMN     "titleStatus" "TitleStatus",
ADD COLUMN     "vehicleAge" INTEGER;
