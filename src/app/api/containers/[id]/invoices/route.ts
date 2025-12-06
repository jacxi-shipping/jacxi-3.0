import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  vendor: z.string().optional(),
  date: z.string(),
  dueDate: z.string().optional(),
  status: z.enum(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']).default('DRAFT'),
  fileUrl: z.string().optional(),
  notes: z.string().optional(),
});

// GET - Fetch invoices for a container
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

    const invoices = await prisma.containerInvoice.findMany({
      where: { containerId: params.id },
      orderBy: { date: 'desc' },
    });

    const totals = {
      total: invoices.reduce((sum, inv) => sum + inv.amount, 0),
      paid: invoices.filter(inv => inv.status === 'PAID').reduce((sum, inv) => sum + inv.amount, 0),
      outstanding: invoices.filter(inv => inv.status !== 'PAID' && inv.status !== 'CANCELLED').reduce((sum, inv) => sum + inv.amount, 0),
    };

    return NextResponse.json({
      invoices,
      totals,
      count: invoices.length,
    });
  } catch (error) {
    console.error('Error fetching container invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

// POST - Add invoice to container
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can add invoices
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
    const validatedData = invoiceSchema.parse(body);

    const invoice = await prisma.containerInvoice.create({
      data: {
        containerId: params.id,
        invoiceNumber: validatedData.invoiceNumber,
        amount: validatedData.amount,
        currency: validatedData.currency,
        vendor: validatedData.vendor,
        date: new Date(validatedData.date),
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        status: validatedData.status,
        fileUrl: validatedData.fileUrl,
        notes: validatedData.notes,
      },
    });

    // Create audit log
    await prisma.containerAuditLog.create({
      data: {
        containerId: params.id,
        action: 'INVOICE_ADDED',
        description: `Invoice added: ${validatedData.invoiceNumber} - $${validatedData.amount}`,
        performedBy: session.user.id as string,
        newValue: validatedData.invoiceNumber,
      },
    });

    return NextResponse.json({
      invoice,
      message: 'Invoice added successfully',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error adding invoice:', error);
    return NextResponse.json(
      { error: 'Failed to add invoice' },
      { status: 500 }
    );
  }
}

// PATCH - Update invoice status
export async function PATCH(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get('invoiceId');

    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID required' }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    const invoice = await prisma.containerInvoice.update({
      where: { id: invoiceId },
      data: { status },
    });

    return NextResponse.json({
      invoice,
      message: 'Invoice updated successfully',
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}
