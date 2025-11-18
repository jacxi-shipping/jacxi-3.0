import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, ShipmentStatus } from '@prisma/client';

const prisma = new PrismaClient();

// This endpoint can be called by a cron job to sync shipment statuses
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

    // Get all shipments that are in transit and have auto-update enabled
    const shipmentsToSync = await prisma.shipment.findMany({
      where: {
        status: {
          in: [ShipmentStatus.PENDING, ShipmentStatus.IN_TRANSIT],
        },
        autoStatusUpdate: true,
      },
      select: {
        id: true,
        trackingNumber: true,
        status: true,
        estimatedDelivery: true,
        lastStatusSync: true,
      },
    });

    const results = {
      total: shipmentsToSync.length,
      updated: 0,
      errors: 0,
      details: [] as Array<{
        shipmentId: string;
        trackingNumber: string;
        oldStatus?: string;
        newStatus?: string;
        success?: boolean;
        error?: string;
      }>,
    };

    // Process each shipment
    for (const shipment of shipmentsToSync) {
      try {
        // Call tracking API
        const trackingResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/tracking`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            trackNumber: shipment.trackingNumber,
            needRoute: true,
          }),
        });

        if (!trackingResponse.ok) {
          results.errors++;
          results.details.push({
            shipmentId: shipment.id,
            trackingNumber: shipment.trackingNumber,
            error: 'Failed to fetch tracking data',
          });
          continue;
        }

        const trackingData = await trackingResponse.json();
        const tracking = trackingData.tracking;

        if (!tracking) {
          results.errors++;
          results.details.push({
            shipmentId: shipment.id,
            trackingNumber: shipment.trackingNumber,
            error: 'No tracking data available',
          });
          continue;
        }

        // Determine new status based on tracking data
        let newStatus: ShipmentStatus | null = null;
        
        // Map tracking status to our status
        if (tracking.shipmentStatus) {
          const trackingStatus = tracking.shipmentStatus.toUpperCase();
          
          if (trackingStatus.includes('DELIVERED') || trackingStatus === 'DELIVERED') {
            newStatus = ShipmentStatus.DELIVERED;
          } else if (trackingStatus.includes('TRANSIT') || trackingStatus === 'IN_TRANSIT') {
            newStatus = ShipmentStatus.IN_TRANSIT;
          } else if (trackingStatus.includes('PENDING') || trackingStatus === 'PENDING') {
            newStatus = ShipmentStatus.PENDING;
          }
        }

        // Update shipment if status changed
        if (newStatus && newStatus !== shipment.status) {
          await prisma.shipment.update({
            where: { id: shipment.id },
            data: {
              status: newStatus,
              currentLocation: tracking.currentLocation || undefined,
              progress: tracking.progress || undefined,
              lastStatusSync: new Date(),
            },
          });

          // Create event for status change
          await prisma.shipmentEvent.create({
            data: {
              shipmentId: shipment.id,
              status: newStatus,
              location: tracking.currentLocation || 'Unknown',
              description: `Status automatically updated from tracking API`,
              completed: newStatus === ShipmentStatus.DELIVERED,
            },
          });

          results.updated++;
          results.details.push({
            shipmentId: shipment.id,
            trackingNumber: shipment.trackingNumber,
            oldStatus: shipment.status,
            newStatus: newStatus,
            success: true,
          });
        } else {
          // Just update sync time
          await prisma.shipment.update({
            where: { id: shipment.id },
            data: {
              lastStatusSync: new Date(),
            },
          });
        }
      } catch (error) {
        console.error(`Error processing shipment ${shipment.id}:`, error);
        results.errors++;
        results.details.push({
          shipmentId: shipment.id,
          trackingNumber: shipment.trackingNumber,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      message: 'Shipment status sync completed',
      results,
    }, { status: 200 });
  } catch (error) {
    console.error('Error syncing shipment statuses:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

