import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, ShipmentStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Delivery alert status enum (matches Prisma schema)
enum DeliveryAlertStatus {
  ON_TIME = 'ON_TIME',
  WARNING = 'WARNING',
  OVERDUE = 'OVERDUE',
  DELIVERED = 'DELIVERED',
}

// This endpoint can be called by a cron job to check and update delivery alerts
export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication for cron jobs
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Get all shipments that are not delivered and have an estimated delivery date
    const shipmentsToCheck = await prisma.shipment.findMany({
      where: {
        status: {
          not: ShipmentStatus.DELIVERED,
        },
        estimatedDelivery: {
          not: null,
        },
      },
      select: {
        id: true,
        trackingNumber: true,
        estimatedDelivery: true,
        deliveryAlertStatus: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    const results = {
      total: shipmentsToCheck.length,
      warnings: 0,
      overdue: 0,
      onTime: 0,
      details: [] as Array<{
        shipmentId: string;
        trackingNumber: string;
        oldStatus: string;
        newStatus: string;
        estimatedDelivery: Date;
        userName: string;
      }>,
    };

    // Check each shipment
    for (const shipment of shipmentsToCheck) {
      try {
        const eta = new Date(shipment.estimatedDelivery!);
        let newAlertStatus: DeliveryAlertStatus;

        // Determine alert status
        if (now > eta) {
          // Past ETA - OVERDUE
          newAlertStatus = DeliveryAlertStatus.OVERDUE;
          results.overdue++;
        } else if (eta <= threeDaysFromNow) {
          // Within 3 days of ETA - WARNING
          newAlertStatus = DeliveryAlertStatus.WARNING;
          results.warnings++;
        } else {
          // More than 3 days until ETA - ON_TIME
          newAlertStatus = DeliveryAlertStatus.ON_TIME;
          results.onTime++;
        }

        // Update if status changed
        if (newAlertStatus !== shipment.deliveryAlertStatus) {
          await prisma.shipment.update({
            where: { id: shipment.id },
            data: {
              deliveryAlertStatus: newAlertStatus as typeof DeliveryAlertStatus[keyof typeof DeliveryAlertStatus],
            },
          });

          results.details.push({
            shipmentId: shipment.id,
            trackingNumber: shipment.trackingNumber,
            oldStatus: shipment.deliveryAlertStatus,
            newStatus: newAlertStatus,
            estimatedDelivery: eta,
            userName: shipment.user.name || shipment.user.email,
          });

          // TODO: Send notification to user
          // You can implement email/SMS notifications here based on the alert status
        }
      } catch (error) {
        console.error(`Error checking shipment ${shipment.id}:`, error);
      }
    }

    return NextResponse.json({
      message: 'Delivery alerts check completed',
      results,
    }, { status: 200 });
  } catch (error) {
    console.error('Error checking delivery alerts:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

