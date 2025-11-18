import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all'; // all, shipments, items, users
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
      items?: Array<Record<string, unknown>>;
      users?: Array<Record<string, unknown>>;
      totalShipments?: number;
      totalItems?: number;
      totalUsers?: number;
    } = {};

    // Search Shipments
    if (type === 'all' || type === 'shipments') {
      const where: Prisma.ShipmentWhereInput = {
        ...(isAdmin ? {} : { userId: session.user?.id }),
        OR: query
          ? [
              { trackingNumber: { contains: query, mode: 'insensitive' } },
              { vehicleType: { contains: query, mode: 'insensitive' } },
              { vehicleMake: { contains: query, mode: 'insensitive' } },
              { vehicleModel: { contains: query, mode: 'insensitive' } },
              { vehicleVIN: { contains: query, mode: 'insensitive' } },
              { origin: { contains: query, mode: 'insensitive' } },
              { destination: { contains: query, mode: 'insensitive' } },
            ]
          : undefined,
        ...(status ? { status: status as 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED' } : {}),
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
          },
          orderBy: {
            [sortBy]: sortOrder as 'asc' | 'desc',
          },
          skip,
          take: limit,
        }),
        prisma.shipment.count({ where }),
      ]);

      results.shipments = shipments;
      results.totalShipments = totalShipments;
    }

    // Search Items
    if (type === 'all' || type === 'items') {
      const where: Prisma.ItemWhereInput = {
        OR: query
          ? [
              { vin: { contains: query, mode: 'insensitive' } },
              { lotNumber: { contains: query, mode: 'insensitive' } },
              { auctionCity: { contains: query, mode: 'insensitive' } },
              { trackingNumber: { contains: query, mode: 'insensitive' } },
            ]
          : undefined,
        ...(status ? { status: status as 'ON_HAND' | 'READY_FOR_SHIPMENT' } : {}),
        ...(dateFrom || dateTo
          ? {
              createdAt: {
                ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
                ...(dateTo ? { lte: new Date(dateTo) } : {}),
              },
            }
          : {}),
      };

      const [items, totalItems] = await Promise.all([
        prisma.item.findMany({
          where,
          include: {
            container: {
              select: {
                containerNumber: true,
              },
            },
          },
          orderBy: {
            [sortBy]: sortOrder as 'asc' | 'desc',
          },
          skip,
          take: limit,
        }),
        prisma.item.count({ where }),
      ]);

      results.items = items;
      results.totalItems = totalItems;
    }

    // Search Users (admin only)
    if (isAdmin && (type === 'all' || type === 'users')) {
      const where: Prisma.UserWhereInput = {
        OR: query
          ? [
              { name: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
              { phone: { contains: query, mode: 'insensitive' } },
            ]
          : undefined,
        ...(status ? { role: status } : {}),
      };

      const [users, totalUsers] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            createdAt: true,
          },
          orderBy: {
            [sortBy]: sortOrder as 'asc' | 'desc',
          },
          skip,
          take: limit,
        }),
        prisma.user.count({ where }),
      ]);

      results.users = users;
      results.totalUsers = totalUsers;
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
  }
}

