import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user?.role !== 'admin') {
      return NextResponse.json(
        { message: 'Forbidden: Only admins can view containers' },
        { status: 403 }
      );
    }

    const container = await prisma.container.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { createdAt: 'desc' },
        },
        invoices: {
          include: {
            items: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        shipment: {
          select: {
            trackingNumber: true,
            status: true,
            paymentStatus: true,
          },
        },
      },
    });

    if (!container) {
      return NextResponse.json(
        { message: 'Container not found' },
        { status: 404 }
      );
    }

    // Find all shipments with matching tracking number
    const relatedShipments = await prisma.shipment.findMany({
      where: {
        trackingNumber: container.containerNumber,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ container, shipments: relatedShipments }, { status: 200 });
  } catch (error) {
    console.error('Error fetching container:', error);
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
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user?.role !== 'admin') {
      return NextResponse.json(
        { message: 'Forbidden: Only admins can delete containers' },
        { status: 403 }
      );
    }

    // Check if container exists
    const container = await prisma.container.findUnique({
      where: { id },
      include: {
        items: true,
        invoices: true,
      },
    });

    if (!container) {
      return NextResponse.json(
        { message: 'Container not found' },
        { status: 404 }
      );
    }

    // Delete container (cascade will delete related items and invoices based on schema)
    await prisma.container.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Container deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting container:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

