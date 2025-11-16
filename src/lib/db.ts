import { PrismaClient, QuoteStatus, ShipmentStatus } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Database utility functions
export class DatabaseService {
  // User operations
  static async getUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        shipments: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        quotes: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });
  }

  static async getUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  static async createUser(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
  }) {
    return await prisma.user.create({
      data: userData,
    });
  }

  // Shipment operations
  static async getShipmentByTrackingNumber(trackingNumber: string) {
    return await prisma.shipment.findUnique({
      where: { trackingNumber },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        events: {
          orderBy: { timestamp: 'desc' },
        },
      },
    });
  }

  static async getShipmentsByUserId(userId: string) {
    return await prisma.shipment.findMany({
      where: { userId },
      include: {
        events: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createShipment(shipmentData: {
    trackingNumber: string;
    userId: string;
    vehicleType: string;
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleYear?: number;
    vehicleVIN?: string;
    origin: string;
    destination: string;
    price?: number;
    weight?: number;
    dimensions?: string;
    specialInstructions?: string;
    insuranceValue?: number;
  }) {
    return await prisma.shipment.create({
      data: shipmentData,
    });
  }

  static async updateShipmentStatus(
    trackingNumber: string,
    status: ShipmentStatus,
    currentLocation?: string
  ) {
    return await prisma.shipment.update({
      where: { trackingNumber },
      data: {
        status,
        currentLocation,
        updatedAt: new Date(),
      },
    });
  }

  static async addShipmentEvent(
    shipmentId: string,
    eventData: {
      status: string;
      location: string;
      description?: string;
      completed?: boolean;
      latitude?: number;
      longitude?: number;
    }
  ) {
    return await prisma.shipmentEvent.create({
      data: {
        shipmentId,
        ...eventData,
      },
    });
  }

  // Quote operations
  static async getQuotesByUserId(userId: string) {
    return await prisma.quote.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async updateQuoteStatus(quoteId: string, status: QuoteStatus) {
    return await prisma.quote.update({
      where: { id: quoteId },
      data: {
        status,
        updatedAt: new Date(),
      },
    });
  }

  // Testimonial operations
  static async getFeaturedTestimonials() {
    return await prisma.testimonial.findMany({
      where: {
        status: 'APPROVED',
        featured: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });
  }

  static async getAllTestimonials() {
    return await prisma.testimonial.findMany({
      where: {
        status: 'APPROVED',
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createTestimonial(testimonialData: {
    name: string;
    location: string;
    rating: number;
    content: string;
    image?: string;
  }) {
    return await prisma.testimonial.create({
      data: testimonialData,
    });
  }

  // Blog operations
  static async getPublishedBlogPosts() {
    return await prisma.blogPost.findMany({
      where: {
        published: true,
      },
      orderBy: { publishedAt: 'desc' },
    });
  }

  static async getBlogPostBySlug(slug: string) {
    return await prisma.blogPost.findUnique({
      where: { slug },
    });
  }

  static async incrementBlogPostViews(slug: string) {
    return await prisma.blogPost.update({
      where: { slug },
      data: {
        views: {
          increment: 1,
        },
      },
    });
  }

  // Contact operations
  static async createContact(contactData: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }) {
    return await prisma.contact.create({
      data: contactData,
    });
  }

  static async getContacts() {
    return await prisma.contact.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // Newsletter operations
  static async subscribeToNewsletter(email: string) {
    return await prisma.newsletter.upsert({
      where: { email },
      update: {
        status: 'ACTIVE',
        updatedAt: new Date(),
      },
      create: {
        email,
        status: 'ACTIVE',
      },
    });
  }

  static async unsubscribeFromNewsletter(email: string) {
    return await prisma.newsletter.update({
      where: { email },
      data: {
        status: 'UNSUBSCRIBED',
        updatedAt: new Date(),
      },
    });
  }

  // Analytics operations
  static async getDashboardStats() {
    const [
      totalUsers,
      totalShipments,
      activeShipments,
      totalQuotes,
      pendingQuotes,
      totalRevenue,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.shipment.count(),
      prisma.shipment.count({
        where: {
          status: {
            in: ['IN_TRANSIT', 'AT_PORT', 'LOADED_ON_VESSEL', 'IN_TRANSIT_OCEAN'],
          },
        },
      }),
      prisma.quote.count(),
      prisma.quote.count({
        where: { status: 'PENDING' },
      }),
      prisma.shipment.aggregate({
        _sum: { price: true },
        where: { status: 'DELIVERED' },
      }),
    ]);

    return {
      totalUsers,
      totalShipments,
      activeShipments,
      totalQuotes,
      pendingQuotes,
      totalRevenue: totalRevenue._sum.price || 0,
    };
  }

  static async getRecentActivity() {
    const [recentShipments, recentQuotes, recentContacts] = await Promise.all([
      prisma.shipment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      }),
      prisma.quote.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      }),
      prisma.contact.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      recentShipments,
      recentQuotes,
      recentContacts,
    };
  }
}
