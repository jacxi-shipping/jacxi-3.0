import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

// GET all events for a shipment
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
    });

    if (!shipment) {
      return NextResponse.json(
        { message: 'Shipment not found' },
        { status: 404 }
      );
    }

    // Check permission
    if (session.user?.role !== 'admin' && shipment.userId !== session.user?.id) {
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }

    const events = await prisma.shipmentEvent.findMany({
      where: { shipmentId: id },
      orderBy: { timestamp: 'desc' },
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new event for a shipment
export async function POST(
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
    });

    if (!shipment) {
      return NextResponse.json(
        { message: 'Shipment not found' },
        { status: 404 }
      );
    }

    // Check permission - only admin can add events
    if (session.user?.role !== 'admin') {
      return NextResponse.json(
        { message: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const data = await request.json();
    const { 
      status,
      location,
      description,
      completed,
      latitude,
      longitude
    } = data;

    if (!status || !location) {
      return NextResponse.json(
        { message: 'Status and location are required' },
        { status: 400 }
      );
    }

    const event = await prisma.shipmentEvent.create({
      data: {
        shipmentId: id,
        status,
        location,
        description,
        completed: completed || false,
        latitude,
        longitude,
      },
    });

    // Optionally update shipment status if provided
    if (status && shipment.status !== status) {
      await prisma.shipment.update({
        where: { id },
        data: { status },
      });
    }

    return NextResponse.json({
      message: 'Event created successfully',
      event
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

