import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const userId = id;

    if (!userId) {
      return NextResponse.json({ message: 'User ID required' }, { status: 400 });
    }

    // Users can view their own profile, admins can view any profile
    if (session.user?.role !== 'admin' && session.user?.id !== userId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    // Only admins can delete users
    if (session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden: Only admins can delete users' }, { status: 403 });
    }
    const { id } = await params;
    const userId = id;
    if (!userId) {
      return NextResponse.json({ message: 'User ID required' }, { status: 400 });
    }
    // Prevent self-delete
    if (session.user.id === userId) {
      return NextResponse.json({ message: 'You cannot delete your own account.' }, { status: 400 });
    }
    const deleted = await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
