import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma, ShipmentSimpleStatus } from '@prisma/client';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all';
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;
    const isAdmin = session.user?.role === 'admin';

    const results: {
      shipments?: Array<Record<string, unknown>>;
      totalShipments?: number;
    } = {};

    // Search Shipments
    if (type === 'all' || type === 'shipments') {
      // Build OR conditions for search
      const orConditions: Prisma.ShipmentWhereInput[] = [];
      
      if (query) {
        orConditions.push(
          { vehicleType: { contains: query, mode: 'insensitive' } },
          { vehicleMake: { contains: query, mode: 'insensitive' } },
          { vehicleModel: { contains: query, mode: 'insensitive' } },
          { vehicleVIN: { contains: query, mode: 'insensitive' } },
          { lotNumber: { contains: query, mode: 'insensitive' } },
          { auctionName: { contains: query, mode: 'insensitive' } }
        );
        
        if (isAdmin) {
          orConditions.push({
            container: {
              OR: [
                { loadingPort: { contains: query, mode: 'insensitive' } },
                { destinationPort: { contains: query, mode: 'insensitive' } },
                { containerNumber: { contains: query, mode: 'insensitive' } },
                { trackingNumber: { contains: query, mode: 'insensitive' } },
              ]
            }
          });
        }
      }

      const where: Prisma.ShipmentWhereInput = {
        ...(isAdmin ? {} : { userId: session.user?.id }),
        ...(orConditions.length > 0 ? { OR: orConditions } : {}),
        ...(status ? { status: status as ShipmentSimpleStatus } : {}),
        ...(dateFrom || dateTo
          ? {
              createdAt: {
                ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
                ...(dateTo ? { lte: new Date(dateTo) } : {}),
              },
            }
          : {}),
        ...(minPrice || maxPrice
          ? {
              price: {
                ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
                ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
              },
            }
          : {}),
        ...(userId ? { userId } : {}),
      };

      const [shipments, totalShipments] = await Promise.all([
        prisma.shipment.findMany({
          where,
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
            container: {
              select: {
                id: true,
                containerNumber: true,
                trackingNumber: true,
                loadingPort: true,
                destinationPort: true,
                status: true,
                progress: true,
                estimatedArrival: true,
              },
            },
          },
          orderBy: {
            [sortBy]: sortOrder as 'asc' | 'desc',
          },
          skip,
          take: limit,
        }),
        prisma.shipment.count({ where }),
      ]);

      // Transform shipments to match expected interface
      const transformedShipments = shipments.map(shipment => {
        const trackingNumber = shipment.container?.trackingNumber || 
                              shipment.container?.containerNumber || 
                              `VIN-${shipment.vehicleVIN?.slice(-8) || shipment.id.slice(-8)}`;
        const origin = shipment.container?.loadingPort || 'N/A';
        const destination = shipment.container?.destinationPort || 'N/A';
        const progress = shipment.container?.progress || 0;
        const estimatedDelivery = shipment.container?.estimatedArrival || null;

        return {
          ...shipment,
          trackingNumber,
          origin,
          destination,
          progress,
          estimatedDelivery,
        };
      });

      results.shipments = transformedShipments;
      results.totalShipments = totalShipments;
    }

    return NextResponse.json({
      ...results,
      page,
      limit,
      query,
    });
  } catch (error) {
    console.error('Error searching:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
