import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

// Temporary types until migration
type TempQualityCheckType = 'INITIAL_INSPECTION' | 'PRE_LOADING' | 'POST_LOADING' | 'DELIVERY_INSPECTION' | 'DAMAGE_ASSESSMENT';
type TempQualityCheckStatus = 'PENDING' | 'IN_PROGRESS' | 'PASSED' | 'FAILED' | 'REQUIRES_ATTENTION';

// GET: Fetch quality checks
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const shipmentId = searchParams.get('shipmentId');
    const itemId = searchParams.get('itemId');
    const status = searchParams.get('status');

    type WhereType = {
      shipmentId?: string;
      itemId?: string;
      status?: TempQualityCheckStatus;
    };
    const where: WhereType = {};
    if (shipmentId) where.shipmentId = shipmentId;
    if (itemId) where.itemId = itemId;
    if (status) where.status = status as TempQualityCheckStatus;

    const qualityChecks = await prisma.qualityCheck.findMany({
      where,
      include: {
        shipment: {
          select: {
            trackingNumber: true,
            vehicleType: true,
          },
        },
        item: {
          select: {
            vin: true,
            lotNumber: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ qualityChecks });
  } catch (error) {
    console.error('Error fetching quality checks:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create quality check
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user?.role !== 'admin') {
      return NextResponse.json(
        { message: 'Forbidden: Only admins can create quality checks' },
        { status: 403 }
      );
    }

    const data = await request.json();
    const { shipmentId, itemId, checkType, inspector, notes, photos } = data;

    if (!shipmentId || !checkType) {
      return NextResponse.json(
        { message: 'Shipment ID and check type are required' },
        { status: 400 }
      );
    }

    const qualityCheck = await prisma.qualityCheck.create({
      data: {
        shipmentId,
        itemId: itemId || null,
        checkType: checkType as TempQualityCheckType,
        status: 'PENDING' as TempQualityCheckStatus,
        inspector: inspector || session.user?.name || session.user?.email,
        notes: notes || null,
        photos: photos || [],
      },
      include: {
        shipment: {
          select: {
            trackingNumber: true,
            vehicleType: true,
          },
        },
      },
    });

    return NextResponse.json(
      { message: 'Quality check created successfully', qualityCheck },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating quality check:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

