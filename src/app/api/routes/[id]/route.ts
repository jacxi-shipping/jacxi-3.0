import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

// GET: Get single route with shipments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Note: This will work after migration
    return NextResponse.json({
      message: 'Route optimization feature will be available after migration',
      route: null,
    });

    /*
    const route = await prisma.route.findUnique({
      where: { id },
      include: {
        shipments: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!route) {
      return NextResponse.json(
        { message: 'Route not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ route });
    */
  } catch (error) {
    console.error('Error fetching route:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH: Update route
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user?.role !== 'admin') {
      return NextResponse.json(
        { message: 'Forbidden: Only admins can update routes' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const data = await request.json();

    // Note: This will work after migration
    return NextResponse.json({
      message: 'Route optimization feature will be available after migration',
      route: {
        id,
        ...data,
      },
    });

    /*
    const { name, status, waypoints, distance, estimatedTime, cost, preferences } = data;
    
    const updateData: any = {};
    if (name) updateData.name = name;
    if (status) updateData.status = status as RouteStatus;
    if (waypoints) updateData.waypoints = waypoints;
    if (distance !== undefined) updateData.distance = distance;
    if (estimatedTime !== undefined) updateData.estimatedTime = estimatedTime;
    if (cost !== undefined) updateData.cost = cost;
    if (preferences !== undefined) updateData.preferences = preferences;

    const route = await prisma.route.update({
      where: { id },
      data: updateData,
      include: {
        shipments: {
          select: {
            id: true,
            trackingNumber: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Route updated successfully',
      route,
    });
    */
  } catch (error) {
    console.error('Error updating route:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete route
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user?.role !== 'admin') {
      return NextResponse.json(
        { message: 'Forbidden: Only admins can delete routes' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Note: This will work after migration
    return NextResponse.json({
      message: 'Route optimization feature will be available after migration',
    });

    /*
    await prisma.route.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Route deleted successfully',
    });
    */
  } catch (error) {
    console.error('Error deleting route:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

