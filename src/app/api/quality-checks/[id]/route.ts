import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

// Temporary type until migration
type TempQualityCheckStatus = 'PENDING' | 'IN_PROGRESS' | 'PASSED' | 'FAILED' | 'REQUIRES_ATTENTION';

// PATCH: Update quality check
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
        { message: 'Forbidden: Only admins can update quality checks' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const data = await request.json();
    const { status, inspector, notes, photos } = data;

    type UpdateDataType = {
      status?: TempQualityCheckStatus;
      checkedAt?: Date;
      inspector?: string;
      notes?: string | null;
      photos?: string[];
    };
    const updateData: UpdateDataType = {};
    if (status) {
      updateData.status = status as TempQualityCheckStatus;
      if (status === 'PASSED' || status === 'FAILED') {
        updateData.checkedAt = new Date();
      }
    }
    if (inspector) updateData.inspector = inspector;
    if (notes !== undefined) updateData.notes = notes;
    if (photos) updateData.photos = photos;

    const qualityCheck = await prisma.qualityCheck.update({
      where: { id },
      data: updateData,
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
    });

    return NextResponse.json({
      message: 'Quality check updated successfully',
      qualityCheck,
    });
  } catch (error) {
    console.error('Error updating quality check:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete quality check
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
        { message: 'Forbidden: Only admins can delete quality checks' },
        { status: 403 }
      );
    }

    const { id } = await params;

    await prisma.qualityCheck.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Quality check deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting quality check:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

