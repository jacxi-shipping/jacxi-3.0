import { NextRequest, NextResponse } from 'next/server';
import { Prisma, PrismaClient } from '@prisma/client';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

const BACKUP_DIR = path.join(process.cwd(), 'backups');
const BACKUP_PREFIX = 'jacxi-backup-';

type BackupFileInfo = {
  fileName: string;
  absolutePath: string;
  timestamp: string;
};

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord => typeof value === 'object' && value !== null;

type ShipmentEventBackup = UnknownRecord & {
  id: string;
  status: string;
  location: string;
  timestamp?: string | null;
  description?: string | null;
  completed?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
};

const isShipmentEventBackup = (value: unknown): value is ShipmentEventBackup =>
  isRecord(value) && typeof value.id === 'string' && typeof value.status === 'string' && typeof value.location === 'string';

type ShipmentBackup = UnknownRecord & {
  id: string;
  userId: string;
  trackingNumber: string;
  status: string;
  events?: unknown;
  createdAt?: string | null;
  updatedAt?: string | null;
  estimatedDelivery?: string | null;
  actualDelivery?: string | null;
};

const isShipmentBackup = (value: unknown): value is ShipmentBackup =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.userId === 'string' &&
  typeof value.trackingNumber === 'string' &&
  typeof value.status === 'string';

type QuoteBackup = UnknownRecord & {
  id: string;
  userId: string;
  vehicleType: string;
  origin: string;
  destination: string;
  status: string;
  vehicleMake?: string | null;
  vehicleModel?: string | null;
  vehicleYear?: number | null;
  price?: number | null;
  validUntil?: string | null;
  notes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

const isQuoteBackup = (value: unknown): value is QuoteBackup =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.userId === 'string' &&
  typeof value.vehicleType === 'string' &&
  typeof value.origin === 'string' &&
  typeof value.destination === 'string' &&
  typeof value.status === 'string';

type TestimonialBackup = UnknownRecord & {
  id: string;
  name: string;
  location?: string | null;
  rating: number;
  content: string;
  image?: string | null;
  featured?: boolean;
  status: string;
  createdAt?: string | null;
  updatedAt?: string | null;
};

const isTestimonialBackup = (value: unknown): value is TestimonialBackup =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.name === 'string' &&
  typeof value.content === 'string' &&
  typeof value.status === 'string' &&
  typeof value.rating === 'number';

type BlogPostBackup = UnknownRecord & {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  author: string;
  published?: boolean;
  publishedAt?: string | null;
  tags?: string[] | null;
  views?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

const isBlogPostBackup = (value: unknown): value is BlogPostBackup =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.title === 'string' &&
  typeof value.slug === 'string' &&
  typeof value.content === 'string' &&
  typeof value.author === 'string';

type ContactBackup = UnknownRecord & {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  status: string;
  createdAt?: string | null;
  updatedAt?: string | null;
};

const isContactBackup = (value: unknown): value is ContactBackup =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.name === 'string' &&
  typeof value.email === 'string' &&
  typeof value.subject === 'string' &&
  typeof value.message === 'string' &&
  typeof value.status === 'string';

type NewsletterBackup = UnknownRecord & {
  id: string;
  email: string;
  status: string;
  createdAt?: string | null;
  updatedAt?: string | null;
};

const isNewsletterBackup = (value: unknown): value is NewsletterBackup =>
  isRecord(value) && typeof value.id === 'string' && typeof value.email === 'string' && typeof value.status === 'string';

type BackupPayload = {
  data: {
    shipments?: unknown;
    quotes?: unknown;
    testimonials?: unknown;
    blogPosts?: unknown;
    contacts?: unknown;
    newsletters?: unknown;
  };
};

const ensureBackupDir = async () => {
  await fs.mkdir(BACKUP_DIR, { recursive: true });
};

const listBackups = async (): Promise<BackupFileInfo[]> => {
  await ensureBackupDir();
  const files = await fs.readdir(BACKUP_DIR);
  const backups = files
    .filter((file) => file.startsWith(BACKUP_PREFIX) && file.endsWith('.json'))
    .map((file) => ({
      fileName: file,
      absolutePath: path.join(BACKUP_DIR, file),
      timestamp: file.replace(BACKUP_PREFIX, '').replace('.json', ''),
    }))
    .sort((a, b) => (a.fileName < b.fileName ? 1 : -1));
  return backups;
};

const getLatestBackup = async () => {
  const backups = await listBackups();
  return backups.length ? backups[0] : null;
};

const runBackupScript = async () =>
  new Promise<void>((resolve, reject) => {
    const child = spawn('node', ['scripts/backup-db.js'], {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'inherit',
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Backup script exited with code ${code}`));
      }
    });
  });

const parseIso = (value?: string | null) => {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed;
};

const restoreFromBackup = async (payload: unknown) => {
  if (!isRecord(payload) || !isRecord(payload.data)) {
    throw new Error('Invalid backup payload.');
  }

  const data = payload.data as BackupPayload['data'];

  await prisma.$transaction(async (tx) => {
    await tx.shipmentEvent.deleteMany();
    await tx.shipment.deleteMany();
    await tx.quote.deleteMany();
    await tx.testimonial.deleteMany();
    await tx.blogPost.deleteMany();
    await tx.contact.deleteMany();
    await tx.newsletter.deleteMany();

    if (Array.isArray(data.shipments)) {
      for (const shipmentEntry of data.shipments) {
        if (!isShipmentBackup(shipmentEntry)) continue;
        const shipment = shipmentEntry;

        const userExists = await tx.user.findUnique({ where: { id: shipment.userId }, select: { id: true } });
        if (!userExists) continue;

        const { events, id, createdAt, updatedAt, ...rest } = shipment;
        try {
          const restData = rest as Partial<Prisma.ShipmentUncheckedCreateInput>;
          const shipmentEvents = Array.isArray(events)
            ? events.filter(isShipmentEventBackup).map((event) => ({
                id: event.id,
                status: event.status,
                location: event.location,
                timestamp: parseIso(event.timestamp) ?? new Date(),
                description: typeof event.description === 'string' ? event.description : null,
                completed: Boolean(event.completed),
                createdAt: parseIso(event.createdAt),
                updatedAt: parseIso(event.updatedAt),
              }))
            : undefined;

          await tx.shipment.create({
            data: {
              ...(restData as Prisma.ShipmentUncheckedCreateInput),
              id,
              createdAt: parseIso(createdAt),
              updatedAt: parseIso(updatedAt),
              estimatedDelivery: parseIso(shipment.estimatedDelivery),
              actualDelivery: parseIso(shipment.actualDelivery),
              events: shipmentEvents ? { create: shipmentEvents } : undefined,
            },
          });
        } catch (error) {
          console.error('Failed to restore shipment', shipment.id, error);
        }
      }
    }

    if (Array.isArray(data.quotes)) {
      for (const quoteEntry of data.quotes) {
        if (!isQuoteBackup(quoteEntry)) continue;
        const quote = quoteEntry;
        try {
          const quoteData = {
            ...(quote as Partial<Prisma.QuoteUncheckedCreateInput>),
            validUntil: parseIso(quote.validUntil),
            createdAt: parseIso(quote.createdAt),
            updatedAt: parseIso(quote.updatedAt),
          } as Prisma.QuoteUncheckedCreateInput;

          await tx.quote.create({ data: quoteData });
        } catch (error) {
          console.error('Failed to restore quote', quote.id, error);
        }
      }
    }

    if (Array.isArray(data.testimonials)) {
      for (const testimonialEntry of data.testimonials) {
        if (!isTestimonialBackup(testimonialEntry)) continue;
        const testimonial = testimonialEntry;
        try {
          const testimonialData = {
            ...(testimonial as Partial<Prisma.TestimonialUncheckedCreateInput>),
            createdAt: parseIso(testimonial.createdAt),
            updatedAt: parseIso(testimonial.updatedAt),
          } as Prisma.TestimonialUncheckedCreateInput;

          await tx.testimonial.create({ data: testimonialData });
        } catch (error) {
          console.error('Failed to restore testimonial', testimonial.id, error);
        }
      }
    }

    if (Array.isArray(data.blogPosts)) {
      for (const postEntry of data.blogPosts) {
        if (!isBlogPostBackup(postEntry)) continue;
        const post = postEntry;
        try {
          const postData = {
            ...(post as Partial<Prisma.BlogPostUncheckedCreateInput>),
            publishedAt: parseIso(post.publishedAt),
            createdAt: parseIso(post.createdAt),
            updatedAt: parseIso(post.updatedAt),
            tags: Array.isArray(post.tags) ? post.tags : [],
            views: typeof post.views === 'number' ? post.views : 0,
          } as Prisma.BlogPostUncheckedCreateInput;

          await tx.blogPost.create({ data: postData });
        } catch (error) {
          console.error('Failed to restore blog post', post.id, error);
        }
      }
    }

    if (Array.isArray(data.contacts)) {
      const contactData = data.contacts
        .filter(isContactBackup)
        .map((contact) => ({
          id: contact.id,
          name: contact.name,
          email: contact.email,
          phone: typeof contact.phone === 'string' ? contact.phone : null,
          subject: contact.subject,
          message: contact.message,
          status: contact.status,
          createdAt: parseIso(contact.createdAt) ?? new Date(),
          updatedAt: parseIso(contact.updatedAt) ?? new Date(),
        })) as Prisma.ContactCreateManyInput[];

      if (contactData.length) {
        await tx.contact.createMany({ data: contactData });
      }
    }

    if (Array.isArray(data.newsletters)) {
      const newsletterData = data.newsletters
        .filter(isNewsletterBackup)
        .map((newsletter) => ({
          id: newsletter.id,
          email: newsletter.email,
          status: newsletter.status,
          createdAt: parseIso(newsletter.createdAt) ?? new Date(),
          updatedAt: parseIso(newsletter.updatedAt) ?? new Date(),
        })) as Prisma.NewsletterCreateManyInput[];

      if (newsletterData.length) {
        await tx.newsletter.createMany({ data: newsletterData });
      }
    }
  });
};

export async function GET() {
  try {
    const latest = await getLatestBackup();
    return NextResponse.json({
      lastBackupAt: latest ? latest.timestamp : null,
      backupPath: latest ? latest.absolutePath : null,
    });
  } catch (error) {
    console.error('Failed to read backup info', error);
    return NextResponse.json({ message: 'Unable to read backup info.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body?.action;

    if (action === 'backup') {
      await runBackupScript();
      const latest = await getLatestBackup();
      return NextResponse.json({
        message: 'Backup completed successfully.',
        lastBackupAt: latest ? latest.timestamp : null,
        backupPath: latest ? latest.absolutePath : null,
      });
    }

    if (action === 'restore') {
      const backupContent = body?.backupContent;
      if (!backupContent || typeof backupContent !== 'string') {
        return NextResponse.json({ message: 'Backup file content is required.' }, { status: 400 });
      }

      const parsed = JSON.parse(backupContent);
      await restoreFromBackup(parsed);
      const latest = await getLatestBackup();
      return NextResponse.json({
        message: 'Restore completed successfully. Validate data before continuing operations.',
        lastBackupAt: latest ? latest.timestamp : null,
        backupPath: latest ? latest.absolutePath : null,
      });
    }

    return NextResponse.json({ message: 'Unsupported backup action.' }, { status: 400 });
  } catch (error: unknown) {
    console.error('Backup endpoint error', error);
    const message = error instanceof Error ? error.message : 'Backup operation failed.';
    return NextResponse.json({ message }, { status: 500 });
  }
}
