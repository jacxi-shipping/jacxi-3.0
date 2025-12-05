import { NextRequest, NextResponse } from 'next/server';
import { Prisma, PrismaClient, ShipmentStatus, TitleStatus } from '@prisma/client';
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
  origin?: string;
  destination?: string;
  status?: ShipmentStatus;
  currentLocation?: string | null;
  estimatedDelivery?: string | null;
  actualDelivery?: string | null;
  progress?: number | string | null;
  arrivalPhotos?: string[] | null;
  containerPhotos?: string[] | null;
  replaceArrivalPhotos?: boolean;
  weight?: number | string | null;
  dimensions?: string | null;
  specialInstructions?: string | null;
  insuranceValue?: number | string | null;
  price?: number | string | null;
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
            name: true,
            email: true,
            phone: true,
          },
        },
        events: {
          orderBy: {
            timestamp: 'desc',
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

    const data = (await request.json()) as UpdateShipmentPayload;
    const {
      userId,
      vehicleType,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      vehicleVIN,
      vehicleColor,
      lotNumber,
      auctionName,
      origin,
      destination,
      status,
      currentLocation,
      estimatedDelivery,
      actualDelivery,
      progress,
      arrivalPhotos,
      containerPhotos,
      replaceArrivalPhotos,
      weight,
      dimensions,
      specialInstructions,
      insuranceValue,
      price,
      hasKey,
      hasTitle,
      titleStatus,
    } = data;

    // Get existing shipment to merge arrival photos
    const existingShipment = await prisma.shipment.findUnique({
      where: { id },
      select: { 
        arrivalPhotos: true,
        vehicleVIN: true,
      },
    });

    // Check for duplicate VIN if VIN is being changed
    if (vehicleVIN !== undefined && vehicleVIN && vehicleVIN.trim()) {
      // Only check if VIN is different from current VIN
      if (vehicleVIN.trim() !== existingShipment?.vehicleVIN) {
        const duplicateShipment = await prisma.shipment.findFirst({
          where: { 
            vehicleVIN: vehicleVIN.trim(),
            id: { not: id }, // Exclude current shipment
          },
          select: {
            id: true,
            trackingNumber: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        });

        if (duplicateShipment) {
          return NextResponse.json(
            { 
              message: `This VIN is already assigned to another shipment (Tracking: ${duplicateShipment.trackingNumber}, User: ${duplicateShipment.user.name || duplicateShipment.user.email})`,
            },
            { status: 400 }
          );
        }
      }
    }

    const sanitizedContainerPhotos = Array.isArray(containerPhotos)
      ? containerPhotos.filter((photo): photo is string => typeof photo === 'string')
      : undefined;
    const sanitizedArrivalPhotos = Array.isArray(arrivalPhotos)
      ? arrivalPhotos.filter((photo): photo is string => typeof photo === 'string')
      : undefined;

    const updateData: Prisma.ShipmentUncheckedUpdateInput = {};

    // User assignment
    if (userId) updateData.userId = userId;

    // Vehicle information
    if (vehicleType) updateData.vehicleType = vehicleType;
    if (vehicleMake !== undefined) updateData.vehicleMake = vehicleMake;
    if (vehicleModel !== undefined) updateData.vehicleModel = vehicleModel;
    if (vehicleVIN !== undefined) updateData.vehicleVIN = vehicleVIN;
    if (vehicleColor !== undefined) updateData.vehicleColor = vehicleColor;
    if (lotNumber !== undefined) updateData.lotNumber = lotNumber;
    if (auctionName !== undefined) updateData.auctionName = auctionName;
    
    if (vehicleYear !== undefined) {
      const parsedYear = typeof vehicleYear === 'string' ? parseInt(vehicleYear, 10) : vehicleYear;
      if (typeof parsedYear === 'number' && !Number.isNaN(parsedYear)) {
        updateData.vehicleYear = parsedYear;
        // Recalculate vehicle age
        const currentYear = new Date().getFullYear();
        updateData.vehicleAge = currentYear - parsedYear;
      }
    }

    // Shipping information
    if (origin !== undefined) updateData.origin = origin;
    if (destination !== undefined) updateData.destination = destination;
    if (status) updateData.status = status;
    if (currentLocation !== undefined) updateData.currentLocation = currentLocation;
    if (estimatedDelivery) updateData.estimatedDelivery = new Date(estimatedDelivery);
    if (actualDelivery) updateData.actualDelivery = new Date(actualDelivery);
    
    if (progress !== undefined && progress !== null) {
      const parsedProgress = typeof progress === 'string' ? parseInt(progress, 10) : progress;
      if (typeof parsedProgress === 'number' && !Number.isNaN(parsedProgress)) {
        updateData.progress = parsedProgress;
      }
    }

    // Additional details
    if (dimensions !== undefined) updateData.dimensions = dimensions;
    if (specialInstructions !== undefined) updateData.specialInstructions = specialInstructions;

    if (weight !== undefined) {
      const parsedWeight = typeof weight === 'string' ? parseFloat(weight) : weight;
      if (typeof parsedWeight === 'number' && !Number.isNaN(parsedWeight)) {
        updateData.weight = parsedWeight;
      }
    }

    if (insuranceValue !== undefined) {
      const parsedInsurance = typeof insuranceValue === 'string' ? parseFloat(insuranceValue) : insuranceValue;
      if (typeof parsedInsurance === 'number' && !Number.isNaN(parsedInsurance)) {
        updateData.insuranceValue = parsedInsurance;
      }
    }

    if (price !== undefined) {
      const parsedPrice = typeof price === 'string' ? parseFloat(price) : price;
      if (typeof parsedPrice === 'number' && !Number.isNaN(parsedPrice)) {
        updateData.price = parsedPrice;
      }
    }

    if (sanitizedContainerPhotos) {
      updateData.containerPhotos = sanitizedContainerPhotos;
    }

    // Handle arrival photos - append to existing ones
    if (sanitizedArrivalPhotos) {
      updateData.arrivalPhotos = replaceArrivalPhotos
        ? sanitizedArrivalPhotos
        : [...(existingShipment?.arrivalPhotos ?? []), ...sanitizedArrivalPhotos];
    }

    // Vehicle details
    if (hasKey !== undefined) updateData.hasKey = hasKey;
    if (hasTitle !== undefined) {
      updateData.hasTitle = hasTitle;
      // If hasTitle is false or null, clear titleStatus
      if (!hasTitle) {
        updateData.titleStatus = null;
      }
    }
    if (titleStatus !== undefined && hasTitle === true) {
      updateData.titleStatus = titleStatus ? titleStatus as TitleStatus : null;
    }

    // Validate shipping details when changing status to IN_TRANSIT or DELIVERED
    if (status && (status === 'IN_TRANSIT' || status === 'DELIVERED')) {
      // Get the current shipment data to check existing values
      const currentShipment = await prisma.shipment.findUnique({
        where: { id },
        select: {
          origin: true,
          destination: true,
          currentLocation: true,
        },
      });

      // Use updated value if provided, otherwise fall back to existing value
      const finalOrigin = origin !== undefined ? origin : currentShipment?.origin;
      const finalDestination = destination !== undefined ? destination : currentShipment?.destination;
      const finalCurrentLocation = currentLocation !== undefined ? currentLocation : currentShipment?.currentLocation;

      if (!finalOrigin || finalOrigin.trim().length < 2) {
        return NextResponse.json(
          { message: 'Origin is required when status is In Transit or Delivered' },
          { status: 400 }
        );
      }
      if (!finalDestination || finalDestination.trim().length < 2) {
        return NextResponse.json(
          { message: 'Destination is required when status is In Transit or Delivered' },
          { status: 400 }
        );
      }
      if (!finalCurrentLocation || finalCurrentLocation.trim().length < 2) {
        return NextResponse.json(
          { message: 'Current Location is required when status is In Transit or Delivered' },
          { status: 400 }
        );
      }
    }

    const shipment = await prisma.shipment.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        events: {
          orderBy: {
            timestamp: 'desc',
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: 'Shipment updated successfully',
        shipment,
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
