import { NextRequest, NextResponse } from 'next/server';
import { Prisma, PrismaClient, TitleStatus } from '@prisma/client';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

type UpdateShipmentPayload = {
  userId?: string;
  vehicleType?: string;
  vehicleMake?: string | null;
  vehicleModel?: string | null;
  vehicleYear?: number | string | null;
  vehicleVIN?: string | null;
  vehicleColor?: string | null;
  lotNumber?: string | null;
  auctionName?: string | null;
  status?: 'ON_HAND' | 'IN_TRANSIT';
  containerId?: string | null;
  arrivalPhotos?: string[] | null;
  vehiclePhotos?: string[] | null;
  replacePhotos?: boolean;
  weight?: number | string | null;
  dimensions?: string | null;
  specialInstructions?: string | null;
  insuranceValue?: number | string | null;
  price?: number | string | null;
  internalNotes?: string | null;
  hasKey?: boolean | null;
  hasTitle?: boolean | null;
  titleStatus?: string | null;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const shipment = await prisma.shipment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        container: {
          include: {
            trackingEvents: {
              orderBy: {
                eventDate: 'desc',
              },
              take: 10,
            },
          },
        },
        ledgerEntries: {
          orderBy: {
            transactionDate: 'desc',
          },
        },
      },
    });

    if (!shipment) {
      return NextResponse.json(
        { message: 'Shipment not found' },
        { status: 404 }
      );
    }

    // Regular users can only see their own shipments
    if (session.user?.role !== 'admin' && shipment.userId !== session.user?.id) {
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json({ shipment }, { status: 200 });
  } catch (error) {
    console.error('Error fetching shipment:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admins can update shipments
    if (session.user?.role !== 'admin') {
      return NextResponse.json(
        { message: 'Forbidden: Only admins can update shipments' },
        { status: 403 }
      );
    }

    const existingShipment = await prisma.shipment.findUnique({
      where: { id },
      include: { container: true },
    });

    if (!existingShipment) {
      return NextResponse.json(
        { message: 'Shipment not found' },
        { status: 404 }
      );
    }

    const data = (await request.json()) as UpdateShipmentPayload;
    const updateData: Prisma.ShipmentUpdateInput = {};

    // Basic vehicle info
    if (data.userId !== undefined) updateData.userId = data.userId;
    if (data.vehicleType !== undefined) updateData.vehicleType = data.vehicleType;
    if (data.vehicleMake !== undefined) updateData.vehicleMake = data.vehicleMake;
    if (data.vehicleModel !== undefined) updateData.vehicleModel = data.vehicleModel;
    if (data.vehicleColor !== undefined) updateData.vehicleColor = data.vehicleColor;
    if (data.vehicleVIN !== undefined) updateData.vehicleVIN = data.vehicleVIN;
    if (data.lotNumber !== undefined) updateData.lotNumber = data.lotNumber;
    if (data.auctionName !== undefined) updateData.auctionName = data.auctionName;

    // Parse year and calculate age
    if (data.vehicleYear !== undefined) {
      const parsedYear =
        typeof data.vehicleYear === 'number'
          ? data.vehicleYear
          : typeof data.vehicleYear === 'string'
          ? parseInt(data.vehicleYear, 10)
          : null;
      updateData.vehicleYear = parsedYear;
      if (parsedYear) {
        updateData.vehicleAge = new Date().getFullYear() - parsedYear;
      }
    }

    // Container and status
    if (data.status !== undefined) {
      updateData.status = data.status;
      
      // If changing to IN_TRANSIT, container is required
      if (data.status === 'IN_TRANSIT' && !data.containerId && !existingShipment.containerId) {
        return NextResponse.json(
          { message: 'Container ID is required for IN_TRANSIT status' },
          { status: 400 }
        );
      }
      
      // If changing to ON_HAND, remove container
      if (data.status === 'ON_HAND') {
        updateData.containerId = null;
      }
    }

    if (data.containerId !== undefined) {
      if (data.containerId) {
        // Verify container exists
        const container = await prisma.container.findUnique({
          where: { id: data.containerId },
          include: { shipments: true },
        });

        if (!container) {
          return NextResponse.json(
            { message: 'Container not found' },
            { status: 404 }
          );
        }

        // Check capacity
        const currentShipments = container.shipments.filter(s => s.id !== id);
        if (currentShipments.length >= container.maxCapacity) {
          return NextResponse.json(
            { message: `Container is at full capacity (${container.maxCapacity} vehicles)` },
            { status: 400 }
          );
        }

        updateData.containerId = data.containerId;
        updateData.status = 'IN_TRANSIT'; // Auto-set to IN_TRANSIT when assigning container
      } else {
        updateData.containerId = null;
        updateData.status = 'ON_HAND'; // Auto-set to ON_HAND when removing container
      }
    }

    // Photos
    if (data.vehiclePhotos !== undefined) {
      if (data.replacePhotos) {
        updateData.vehiclePhotos = data.vehiclePhotos;
      } else {
        const currentPhotos = (existingShipment.vehiclePhotos as string[]) || [];
        updateData.vehiclePhotos = [...currentPhotos, ...data.vehiclePhotos];
      }
    }

    if (data.arrivalPhotos !== undefined) {
      if (data.replacePhotos) {
        updateData.arrivalPhotos = data.arrivalPhotos;
      } else {
        const currentPhotos = (existingShipment.arrivalPhotos as string[]) || [];
        updateData.arrivalPhotos = [...currentPhotos, ...data.arrivalPhotos];
      }
    }

    // Numeric fields
    if (data.weight !== undefined) {
      updateData.weight =
        typeof data.weight === 'number'
          ? data.weight
          : typeof data.weight === 'string'
          ? parseFloat(data.weight)
          : null;
    }

    if (data.insuranceValue !== undefined) {
      updateData.insuranceValue =
        typeof data.insuranceValue === 'number'
          ? data.insuranceValue
          : typeof data.insuranceValue === 'string'
          ? parseFloat(data.insuranceValue)
          : null;
    }

    if (data.price !== undefined) {
      updateData.price =
        typeof data.price === 'number'
          ? data.price
          : typeof data.price === 'string'
          ? parseFloat(data.price)
          : null;
    }

    // Other fields
    if (data.dimensions !== undefined) updateData.dimensions = data.dimensions;
    if (data.specialInstructions !== undefined) updateData.specialInstructions = data.specialInstructions;
    if (data.internalNotes !== undefined) updateData.internalNotes = data.internalNotes;
    if (data.hasKey !== undefined) updateData.hasKey = data.hasKey;
    if (data.hasTitle !== undefined) updateData.hasTitle = data.hasTitle;
    
    // Title status
    if (data.titleStatus !== undefined) {
      updateData.titleStatus = (data.hasTitle === true && data.titleStatus) ? data.titleStatus as TitleStatus : null;
    }

    const updatedShipment = await prisma.shipment.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        container: true,
      },
    });

    return NextResponse.json(
      {
        message: 'Shipment updated successfully',
        shipment: updatedShipment,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating shipment:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admins can delete shipments
    if (session.user?.role !== 'admin') {
      return NextResponse.json(
        { message: 'Forbidden: Only admins can delete shipments' },
        { status: 403 }
      );
    }

    const shipment = await prisma.shipment.findUnique({
      where: { id },
      include: {
        ledgerEntries: true,
      },
    });

    if (!shipment) {
      return NextResponse.json(
        { message: 'Shipment not found' },
        { status: 404 }
      );
    }

    // Check if shipment has ledger entries
    if (shipment.ledgerEntries.length > 0) {
      return NextResponse.json(
        { 
          message: 'Cannot delete shipment with financial records. Please delete ledger entries first or contact support.' 
        },
        { status: 400 }
      );
    }

    await prisma.shipment.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Shipment deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting shipment:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
