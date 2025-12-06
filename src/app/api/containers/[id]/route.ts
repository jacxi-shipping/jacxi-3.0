import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Schema for updating container
const updateContainerSchema = z.object({
  trackingNumber: z.string().optional(),
  vesselName: z.string().optional(),
  voyageNumber: z.string().optional(),
  shippingLine: z.string().optional(),
  bookingNumber: z.string().optional(),
  loadingPort: z.string().optional(),
  destinationPort: z.string().optional(),
  transshipmentPorts: z.array(z.string()).optional(),
  loadingDate: z.string().optional(),
  departureDate: z.string().optional(),
  estimatedArrival: z.string().optional(),
  actualArrival: z.string().optional(),
  status: z.enum([
    'CREATED',
    'WAITING_FOR_LOADING',
    'LOADED',
    'IN_TRANSIT',
    'ARRIVED_PORT',
    'CUSTOMS_CLEARANCE',
    'RELEASED',
    'CLOSED',
  ]).optional(),
  currentLocation: z.string().optional(),
  progress: z.number().int().min(0).max(100).optional(),
  notes: z.string().optional(),
  autoTrackingEnabled: z.boolean().optional(),
});

// GET - Fetch single container with full details
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const container = await prisma.container.findUnique({
      where: { id: params.id },
      include: {
        shipments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        expenses: {
          orderBy: { date: 'desc' },
        },
        invoices: {
          orderBy: { date: 'desc' },
        },
        documents: {
          orderBy: { uploadedAt: 'desc' },
        },
        trackingEvents: {
          orderBy: { eventDate: 'desc' },
          take: 20,
        },
        auditLogs: {
          orderBy: { timestamp: 'desc' },
          take: 50,
        },
      },
    });

    if (!container) {
      return NextResponse.json({ error: 'Container not found' }, { status: 404 });
    }

    // Calculate totals
    const totalExpenses = container.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalInvoices = container.invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const currentCount = container.shipments.length;

    return NextResponse.json({
      container: {
        ...container,
        currentCount,
        totals: {
          expenses: totalExpenses,
          invoices: totalInvoices,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching container:', error);
    return NextResponse.json(
      { error: 'Failed to fetch container' },
      { status: 500 }
    );
  }
}

// PATCH - Update container
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can update containers
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const container = await prisma.container.findUnique({
      where: { id: params.id },
    });

    if (!container) {
      return NextResponse.json({ error: 'Container not found' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = updateContainerSchema.parse(body);

    // Parse dates if provided
    const updateData: Record<string, unknown> = { ...validatedData };
    if (validatedData.loadingDate) {
      updateData.loadingDate = new Date(validatedData.loadingDate);
    }
    if (validatedData.departureDate) {
      updateData.departureDate = new Date(validatedData.departureDate);
    }
    if (validatedData.estimatedArrival) {
      updateData.estimatedArrival = new Date(validatedData.estimatedArrival);
    }
    if (validatedData.actualArrival) {
      updateData.actualArrival = new Date(validatedData.actualArrival);
    }

    // Update container
    const updatedContainer = await prisma.container.update({
      where: { id: params.id },
      data: updateData,
      include: {
        shipments: true,
        _count: {
          select: {
            shipments: true,
            expenses: true,
            invoices: true,
            documents: true,
          },
        },
      },
    });

    // Create audit logs for significant changes
    const auditLogs = [];

    if (validatedData.status && validatedData.status !== container.status) {
      auditLogs.push({
        containerId: container.id,
        action: 'STATUS_CHANGE',
        description: `Status changed from ${container.status} to ${validatedData.status}`,
        performedBy: session.user.id as string,
        oldValue: container.status,
        newValue: validatedData.status,
      });

      // Cascade status to shipments
      if (validatedData.status === 'LOADED' || validatedData.status === 'IN_TRANSIT') {
        await prisma.shipment.updateMany({
          where: { containerId: container.id },
          data: { status: 'IN_TRANSIT' },
        });
      }
    }

    if (validatedData.estimatedArrival && validatedData.estimatedArrival !== container.estimatedArrival?.toISOString()) {
      auditLogs.push({
        containerId: container.id,
        action: 'ETA_UPDATED',
        description: `ETA updated to ${validatedData.estimatedArrival}`,
        performedBy: session.user.id as string,
        oldValue: container.estimatedArrival?.toISOString() || null,
        newValue: validatedData.estimatedArrival,
      });
    }

    // Bulk create audit logs
    if (auditLogs.length > 0) {
      await prisma.containerAuditLog.createMany({
        data: auditLogs,
      });
    }

    return NextResponse.json({
      container: updatedContainer,
      message: 'Container updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error updating container:', error);
    return NextResponse.json(
      { error: 'Failed to update container' },
      { status: 500 }
    );
  }
}

// DELETE - Delete container
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can delete containers
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const container = await prisma.container.findUnique({
      where: { id: params.id },
      include: {
        shipments: true,
      },
    });

    if (!container) {
      return NextResponse.json({ error: 'Container not found' }, { status: 404 });
    }

    // Check if container has shipments
    if (container.shipments.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete container with assigned shipments. Remove shipments first.' },
        { status: 400 }
      );
    }

    // Delete container (cascade will delete related records)
    await prisma.container.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: 'Container deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting container:', error);
    return NextResponse.json(
      { error: 'Failed to delete container' },
      { status: 500 }
    );
  }
}
