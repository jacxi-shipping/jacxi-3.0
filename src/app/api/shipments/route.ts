import { NextRequest, NextResponse } from 'next/server';
import { Prisma, PrismaClient, ShipmentStatus, TitleStatus } from '@prisma/client';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause based on user role
    const where: Prisma.ShipmentWhereInput = {};
    
    // Regular users can only see their own shipments
    if (session.user?.role !== 'admin') {
      where.userId = session.user?.id;
    }

    // Add status filter if provided
    if (status && status !== 'all' && Object.values(ShipmentStatus).includes(status as ShipmentStatus)) {
      where.status = status as ShipmentStatus;
    }

    const [shipments, total] = await Promise.all([
      prisma.shipment.findMany({
        where,
        select: {
          id: true,
          trackingNumber: true,
          vehicleType: true,
          vehicleMake: true,
          vehicleModel: true,
          origin: true,
          destination: true,
          status: true,
          progress: true,
          estimatedDelivery: true,
          createdAt: true,
          paymentStatus: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          events: {
            orderBy: {
              timestamp: 'desc',
            },
            take: 1,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.shipment.count({ where }),
    ]);

    return NextResponse.json({
      shipments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching shipments:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

type TrackingEventPayload = {
  status?: string;
  location?: string;
  description?: string;
  actual?: boolean;
  timestamp?: string;
};

type CreateShipmentPayload = {
  userId: string;
  vehicleType: string;
  vehicleMake?: string | null;
  vehicleModel?: string | null;
  vehicleYear?: number | string | null;
  vehicleVIN?: string | null;
  vehicleColor?: string | null;
  lotNumber?: string | null;
  auctionName?: string | null;
  origin: string;
  destination: string;
  weight?: number | string | null;
  dimensions?: string | null;
  specialInstructions?: string | null;
  insuranceValue?: number | string | null;
  price?: number | string | null;
  containerPhotos?: string[] | null;
  trackingNumber?: string | null;
  status?: ShipmentStatus | null;
  currentLocation?: string | null;
  estimatedDelivery?: string | null;
  progress?: number | string | null;
  trackingEvents?: unknown;
  trackingCompany?: string | null;
  hasKey?: boolean | null;
  hasTitle?: boolean | null;
  titleStatus?: string | null;
};

const isTrackingEventPayload = (value: unknown): value is TrackingEventPayload =>
  typeof value === 'object' && value !== null;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admins can create shipments and assign them to users
    if (session.user?.role !== 'admin') {
      return NextResponse.json(
        { message: 'Forbidden: Only admins can create shipments' },
        { status: 403 }
      );
    }

    const data = (await request.json()) as CreateShipmentPayload;
    const { 
      userId, // Admin must specify which user this shipment is for
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
      weight,
      dimensions,
      specialInstructions,
      insuranceValue,
      price,
      containerPhotos,
      trackingNumber: providedTrackingNumber,
      status: providedStatus,
      currentLocation,
      estimatedDelivery,
      progress,
      trackingEvents,
      trackingCompany,
      hasKey,
      hasTitle,
      titleStatus,
    } = data;

    // Validate required fields
    if (!vehicleType || !userId) {
      return NextResponse.json(
        { message: 'Missing required fields: vehicleType and userId are required' },
        { status: 400 }
      );
    }

    // For shipments that are ready for shipment (not pending/on-hand), require origin and destination
    const normalizedProvidedStatus = typeof providedStatus === 'string' ? providedStatus.toUpperCase() : providedStatus;
    const isReadyForShipment = normalizedProvidedStatus && normalizedProvidedStatus !== 'PENDING';
    if (isReadyForShipment && (!origin || !destination)) {
      return NextResponse.json(
        { message: 'Origin and destination are required for shipments that are ready for shipment' },
        { status: 400 }
      );
    }

    // Verify that the userId exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Check for duplicate VIN if provided
    if (vehicleVIN && vehicleVIN.trim()) {
      const existingShipment = await prisma.shipment.findFirst({
        where: { 
          vehicleVIN: vehicleVIN.trim(),
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

      if (existingShipment) {
        return NextResponse.json(
          { 
            message: `This VIN is already assigned to another shipment (Tracking: ${existingShipment.trackingNumber}, User: ${existingShipment.user.name || existingShipment.user.email})`,
          },
          { status: 400 }
        );
      }
    }

    // Generate tracking number (allow override when provided)
    const trackingNumber = (providedTrackingNumber || '').trim()
      ? (providedTrackingNumber || '').trim()
      : `JACXI${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const parsedEstimatedDelivery = estimatedDelivery ? new Date(estimatedDelivery) : null;
    const parsedProgress =
      typeof progress === 'number'
        ? progress
        : typeof progress === 'string'
        ? parseInt(progress, 10)
        : null;

    const normalizedStatus = providedStatus ?? ShipmentStatus.PENDING;
    const sanitizedContainerPhotos = Array.isArray(containerPhotos)
      ? containerPhotos.filter((photo): photo is string => typeof photo === 'string')
      : [];
    const sanitizedTrackingEvents = Array.isArray(trackingEvents) ? trackingEvents.filter(isTrackingEventPayload) : [];
    const parsedVehicleYear =
      typeof vehicleYear === 'number'
        ? vehicleYear
        : typeof vehicleYear === 'string'
        ? parseInt(vehicleYear, 10)
        : null;
    const parsedWeight =
      typeof weight === 'number' ? weight : typeof weight === 'string' ? parseFloat(weight) : null;
    const parsedInsuranceValue =
      typeof insuranceValue === 'number'
        ? insuranceValue
        : typeof insuranceValue === 'string'
        ? parseFloat(insuranceValue)
        : null;
    const parsedPrice =
      typeof price === 'number' ? price : typeof price === 'string' ? parseFloat(price) : null;
    
    // Calculate vehicle age if vehicleYear is provided
    const currentYear = new Date().getFullYear();
    const calculatedVehicleAge = parsedVehicleYear ? currentYear - parsedVehicleYear : null;
    
    // Validate titleStatus - only allowed if hasTitle is true
    const finalTitleStatus = (hasTitle === true && titleStatus) ? titleStatus as TitleStatus : null;
    
    // Validate shipping details when status is IN_TRANSIT or DELIVERED
    if (normalizedStatus === ShipmentStatus.IN_TRANSIT || normalizedStatus === ShipmentStatus.DELIVERED) {
      if (!origin || origin.trim().length < 2) {
        return NextResponse.json(
          { message: 'Origin is required when status is In Transit or Delivered' },
          { status: 400 }
        );
      }
      if (!destination || destination.trim().length < 2) {
        return NextResponse.json(
          { message: 'Destination is required when status is In Transit or Delivered' },
          { status: 400 }
        );
      }
      if (!currentLocation || currentLocation.trim().length < 2) {
        return NextResponse.json(
          { message: 'Current Location is required when status is In Transit or Delivered' },
          { status: 400 }
        );
      }
    }
    
    const shipment = await prisma.$transaction(async (tx) => {
      const createdShipment = await tx.shipment.create({
        data: {
          trackingNumber,
          userId: userId, // Use the userId from request (assigned by admin)
          vehicleType,
          vehicleMake,
          vehicleModel,
          vehicleYear: parsedVehicleYear,
          vehicleVIN,
          vehicleColor,
          lotNumber,
          auctionName,
          origin: origin || 'TBD', // Default to 'TBD' for on-hand shipments
          destination: destination || 'TBD', // Default to 'TBD' for on-hand shipments
          status: normalizedStatus,
          currentLocation: currentLocation || origin || 'Warehouse',
          estimatedDelivery: parsedEstimatedDelivery,
          weight: parsedWeight,
          dimensions,
          specialInstructions,
          insuranceValue: parsedInsuranceValue,
          price: parsedPrice,
          containerPhotos: sanitizedContainerPhotos,
          paymentStatus: 'PENDING',
          progress: parsedProgress !== null && !Number.isNaN(parsedProgress) ? parsedProgress : undefined,
          // New fields
          hasKey: typeof hasKey === 'boolean' ? hasKey : null,
          hasTitle: typeof hasTitle === 'boolean' ? hasTitle : null,
          titleStatus: finalTitleStatus,
          vehicleAge: calculatedVehicleAge,
        },
      });

      if (sanitizedTrackingEvents.length) {
        const eventsData: Prisma.ShipmentEventCreateManyInput[] = sanitizedTrackingEvents.map((event) => {
          const eventStatus = (event.status || 'Status update').toString();
          const locationValue = (event.location || origin || 'Unknown location').toString();
          const descriptionParts = [
            typeof event.description === 'string' ? event.description : null,
            trackingCompany ? `Carrier: ${trackingCompany}` : null,
          ].filter(Boolean);

          const base: Prisma.ShipmentEventCreateManyInput = {
            shipmentId: createdShipment.id,
            status: eventStatus,
            location: locationValue,
            description:
              descriptionParts.length > 0
                ? descriptionParts.join(' | ')
                : event.actual
                ? 'Carrier confirmed milestone'
                : 'Projected milestone from carrier',
            completed: Boolean(event.actual),
          };

          if (event.timestamp) {
            base.timestamp = new Date(event.timestamp);
          }

          return base;
        });

        if (eventsData.length === 1) {
          await tx.shipmentEvent.create({ data: eventsData[0] });
        } else {
          await tx.shipmentEvent.createMany({ data: eventsData });
        }
      } else {
        // Create initial event fallback
        await tx.shipmentEvent.create({
          data: {
            shipmentId: createdShipment.id,
            status: normalizedStatus,
            location: currentLocation || origin,
            description: trackingCompany
              ? `Shipment created and synced with ${trackingCompany}`
              : 'Shipment created and pending pickup',
            completed: Boolean(providedStatus && providedStatus !== ShipmentStatus.PENDING),
          },
        });
      }

      return createdShipment;
    });

    return NextResponse.json(
      { 
        message: 'Shipment created successfully',
        shipment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating shipment:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

