import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

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
