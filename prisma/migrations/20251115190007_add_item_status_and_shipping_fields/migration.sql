-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('ON_HAND', 'READY_FOR_SHIPMENT');

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "estimatedDelivery" TIMESTAMP(3),
ADD COLUMN     "shippingDestination" TEXT,
ADD COLUMN     "shippingOrigin" TEXT,
ADD COLUMN     "status" "ItemStatus" NOT NULL DEFAULT 'ON_HAND',
ADD COLUMN     "trackingNumber" TEXT,
ALTER COLUMN "containerId" DROP NOT NULL;
