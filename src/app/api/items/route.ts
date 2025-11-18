import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

// Container status enum (matches Prisma schema)
enum ContainerStatus {
  EMPTY = 'EMPTY',
  PARTIAL = 'PARTIAL',
  FULL = 'FULL',
  SHIPPED = 'SHIPPED',
  ARCHIVED = 'ARCHIVED',
}

// Helper function to update container status based on capacity
// Note: This will be fully functional after migration
/*
async function updateContainerStatus(containerId: string) {
  const container = await prisma.container.findUnique({
    where: { id: containerId },
    select: {
      currentCount: true,
      maxCapacity: true,
    },
  });

  if (!container) return;

  let newStatus: ContainerStatus;
  if (container.currentCount === 0) {
    newStatus = ContainerStatus.EMPTY;
  } else if (container.currentCount >= container.maxCapacity) {
    newStatus = ContainerStatus.FULL;
  } else {
    newStatus = ContainerStatus.PARTIAL;
  }

  await prisma.container.update({
    where: { id: containerId },
    data: { status: newStatus as unknown as string },
  });
}
*/

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user?.role !== 'admin') {
      return NextResponse.json(
        { message: 'Forbidden: Only admins can create items' },
        { status: 403 }
      );
    }

    const data = await request.json();
    const {
      status,
      containerId,
      vin,
      lotNumber,
      auctionCity,
      trackingNumber,
      shippingOrigin,
      shippingDestination,
      estimatedDelivery,
      freightCost,
      towingCost,
      clearanceCost,
      vatCost,
      customsCost,
      otherCost,
    } = data;

    // Validate required fields
    if (!vin || !lotNumber || !auctionCity) {
      return NextResponse.json(
        { message: 'VIN, Lot Number, and Auction City are required' },
        { status: 400 }
      );
    }

    // Validate READY_FOR_SHIPMENT status requirements
    if (status === 'READY_FOR_SHIPMENT') {
      if (!containerId || !trackingNumber || !shippingOrigin || !shippingDestination) {
        return NextResponse.json(
          { message: 'Container, tracking number, origin, and destination are required for ready-to-ship items' },
          { status: 400 }
        );
      }

      // Verify container exists
      const container = await prisma.container.findUnique({
        where: { id: containerId },
      });

      if (!container) {
        return NextResponse.json(
          { message: 'Container not found' },
          { status: 404 }
        );
      }

      // Note: Container capacity checking will be available after migration
      // Uncomment after running migration:
      /*
      // Check if container is full
      if (container.currentCount >= container.maxCapacity) {
        return NextResponse.json(
          { message: `Container is full. Maximum capacity: ${container.maxCapacity} vehicles` },
          { status: 400 }
        );
      }

      // Check if container is already shipped
      if (container.status === ContainerStatus.SHIPPED) {
        return NextResponse.json(
          { message: 'Cannot add items to a shipped container' },
          { status: 400 }
        );
      }
      */
    }

    // Create item
    const item = await prisma.item.create({
      data: {
        status: status || 'ON_HAND',
        containerId: containerId || null,
        vin,
        lotNumber,
        auctionCity,
        trackingNumber: trackingNumber || null,
        shippingOrigin: shippingOrigin || null,
        shippingDestination: shippingDestination || null,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
        freightCost: freightCost ? parseFloat(freightCost) : 0,
        towingCost: towingCost ? parseFloat(towingCost) : 0,
        clearanceCost: clearanceCost ? parseFloat(clearanceCost) : 0,
        vatCost: vatCost ? parseFloat(vatCost) : 0,
        customsCost: customsCost ? parseFloat(customsCost) : 0,
        otherCost: otherCost ? parseFloat(otherCost) : 0,
      },
      include: {
        container: {
          select: {
            containerNumber: true,
          },
        },
      },
    });

    // Note: Container count management will be available after migration
    // Uncomment after running migration:
    /*
    // Increment container count if item is assigned to a container
    if (containerId) {
      await prisma.container.update({
        where: { id: containerId },
        data: { currentCount: { increment: 1 } },
      });

      // Update container status
      await updateContainerStatus(containerId);
    }
    */

    return NextResponse.json(
      { message: 'Item created successfully', item },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

