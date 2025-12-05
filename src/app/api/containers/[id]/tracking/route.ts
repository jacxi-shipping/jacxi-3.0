import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const trackingEventSchema = z.object({
  status: z.string().min(1),
  location: z.string().optional(),
  vesselName: z.string().optional(),
  description: z.string().optional(),
  eventDate: z.string(),
  source: z.string().optional(),
  completed: z.boolean().default(false),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

// GET - Fetch tracking events for a container
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const events = await prisma.containerTrackingEvent.findMany({
      where: { containerId: params.id },
      orderBy: { eventDate: 'desc' },
      take: limit,
    });

    return NextResponse.json({
      events,
      count: events.length,
    });
  } catch (error) {
    console.error('Error fetching tracking events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tracking events' },
      { status: 500 }
    );
  }
}

// POST - Add tracking event to container
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can add tracking events
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Verify container exists
    const container = await prisma.container.findUnique({
      where: { id: params.id },
    });

    if (!container) {
      return NextResponse.json({ error: 'Container not found' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = trackingEventSchema.parse(body);

    const event = await prisma.containerTrackingEvent.create({
      data: {
        containerId: params.id,
        status: validatedData.status,
        location: validatedData.location,
        vesselName: validatedData.vesselName,
        description: validatedData.description,
        eventDate: new Date(validatedData.eventDate),
        source: validatedData.source || 'manual',
        completed: validatedData.completed,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
      },
    });

    // Update container's current location if provided
    if (validatedData.location) {
      await prisma.container.update({
        where: { id: params.id },
        data: {
          currentLocation: validatedData.location,
          lastLocationUpdate: new Date(),
        },
      });
    }

    return NextResponse.json({
      event,
      message: 'Tracking event added successfully',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error adding tracking event:', error);
    return NextResponse.json(
      { error: 'Failed to add tracking event' },
      { status: 500 }
    );
  }
}
