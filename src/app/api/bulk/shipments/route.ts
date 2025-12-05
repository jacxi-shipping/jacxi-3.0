import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, ShipmentStatus } from '@prisma/client';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

// POST: Bulk operations on shipments
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user?.role !== 'admin') {
      return NextResponse.json(
        { message: 'Forbidden: Only admins can perform bulk operations' },
        { status: 403 }
      );
    }

    const { action, shipmentIds, data } = await request.json();

    if (!action || !shipmentIds || !Array.isArray(shipmentIds)) {
      return NextResponse.json(
        { message: 'Action and shipmentIds array are required' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'updateStatus':
        if (!data?.status) {
          return NextResponse.json(
            { message: 'Status is required for updateStatus action' },
            { status: 400 }
          );
        }
        result = await prisma.shipment.updateMany({
          where: { id: { in: shipmentIds } },
          data: { status: data.status as ShipmentStatus },
        });
        break;

      case 'updateProgress':
        if (data?.progress === undefined) {
          return NextResponse.json(
            { message: 'Progress is required for updateProgress action' },
            { status: 400 }
          );
        }
        result = await prisma.shipment.updateMany({
          where: { id: { in: shipmentIds } },
          data: { progress: parseInt(data.progress) },
        });
        break;

      case 'assignUser':
        if (!data?.userId) {
          return NextResponse.json(
            { message: 'User ID is required for assignUser action' },
            { status: 400 }
          );
        }
        result = await prisma.shipment.updateMany({
          where: { id: { in: shipmentIds } },
          data: { userId: data.userId },
        });
        break;

      case 'updatePaymentStatus':
        if (!data?.paymentStatus) {
          return NextResponse.json(
            { message: 'Payment status is required for updatePaymentStatus action' },
            { status: 400 }
          );
        }
        result = await prisma.shipment.updateMany({
          where: { id: { in: shipmentIds } },
          data: { paymentStatus: data.paymentStatus as 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED' },
        });
        break;

      case 'delete':
        result = await prisma.shipment.deleteMany({
          where: { id: { in: shipmentIds } },
        });
        break;

      case 'export':
        // Fetch shipments for export
        const shipments = await prisma.shipment.findMany({
          where: { id: { in: shipmentIds } },
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

        return NextResponse.json({
          message: 'Shipments exported successfully',
          data: shipments,
          count: shipments.length,
        });

      case 'updateLocation':
        if (!data?.currentLocation) {
          return NextResponse.json(
            { message: 'Current location is required for updateLocation action' },
            { status: 400 }
          );
        }
        result = await prisma.shipment.updateMany({
          where: { id: { in: shipmentIds } },
          data: { currentLocation: data.currentLocation },
        });
        break;

      case 'setETA':
        if (!data?.estimatedDelivery) {
          return NextResponse.json(
            { message: 'Estimated delivery is required for setETA action' },
            { status: 400 }
          );
        }
        result = await prisma.shipment.updateMany({
          where: { id: { in: shipmentIds } },
          data: { estimatedDelivery: new Date(data.estimatedDelivery) },
        });
        break;

      default:
        return NextResponse.json(
          { message: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      message: `Bulk ${action} completed successfully`,
      count: result?.count || 0,
    });
  } catch (error) {
    console.error('Error performing bulk operation:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

