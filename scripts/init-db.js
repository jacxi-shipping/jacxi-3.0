let prisma;

async function main() {
  const [{ PrismaClient }, bcryptModule] = await Promise.all([
    import('@prisma/client'),
    import('bcryptjs'),
  ]);

  const bcrypt = bcryptModule.default ?? bcryptModule;
  prisma = new PrismaClient();

  console.log('🌱 Seeding JACXI Shipping database...');

  try {
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@jacxi.com' },
      update: {},
      create: {
        name: 'JACXI Admin',
        email: 'admin@jacxi.com',
        passwordHash: hashedPassword,
        role: 'admin',
        phone: '+1 (555) 123-4567',
        address: '123 Shipping Street',
        city: 'Los Angeles',
        country: 'USA',
      },
    });

    console.log('✅ Admin user created:', admin.email);

    // Create demo customer
    const customerPassword = await bcrypt.hash('customer123', 12);
    
    const customer = await prisma.user.upsert({
      where: { email: 'customer@example.com' },
      update: {},
      create: {
        name: 'Ahmed Khan',
        email: 'customer@example.com',
        passwordHash: customerPassword,
        role: 'user',
        phone: '+93 70 123 4567',
        address: 'Kabul, Afghanistan',
        city: 'Kabul',
        country: 'Afghanistan',
      },
    });

    console.log('✅ Demo customer created:', customer.email);

    // Create sample shipments
    const sampleShipments = [
      {
        trackingNumber: 'JACXI123456789',
        vehicleType: 'sedan',
        vehicleMake: 'Toyota',
        vehicleModel: 'Camry',
        vehicleYear: 2020,
        vehicleVIN: '1HGBH41JXMN109186',
        origin: 'Los Angeles, CA',
        destination: 'Kabul, Afghanistan',
        status: 'IN_TRANSIT',
        currentLocation: 'Port of Los Angeles, CA',
        estimatedDelivery: new Date('2024-11-15'),
        progress: 65,
        price: 2500.00,
        weight: 1500,
        dimensions: '4.8m x 1.8m x 1.4m',
        specialInstructions: 'Handle with care - luxury vehicle',
        insuranceValue: 30000.00,
        userId: customer.id,
      },
      {
        trackingNumber: 'JACXI987654321',
        vehicleType: 'suv',
        vehicleMake: 'Honda',
        vehicleModel: 'CR-V',
        vehicleYear: 2019,
        vehicleVIN: '2HGBH41JXMN109187',
        origin: 'Miami, FL',
        destination: 'Dubai, UAE',
        status: 'AT_PORT',
        currentLocation: 'Port of Miami, FL',
        estimatedDelivery: new Date('2024-11-20'),
        progress: 45,
        price: 2800.00,
        weight: 1600,
        dimensions: '4.6m x 1.8m x 1.7m',
        insuranceValue: 25000.00,
        userId: customer.id,
      },
      {
        trackingNumber: 'JACXI456789123',
        vehicleType: 'truck',
        vehicleMake: 'Ford',
        vehicleModel: 'F-150',
        vehicleYear: 2021,
        vehicleVIN: '3HGBH41JXMN109188',
        origin: 'New York, NY',
        destination: 'Riyadh, KSA',
        status: 'PICKUP_SCHEDULED',
        currentLocation: 'New York, NY',
        estimatedDelivery: new Date('2024-12-01'),
        progress: 10,
        price: 3200.00,
        weight: 2500,
        dimensions: '5.4m x 2.0m x 1.9m',
        insuranceValue: 45000.00,
        userId: customer.id,
      },
    ];

    for (const shipment of sampleShipments) {
      const createdShipment = await prisma.shipment.upsert({
        where: { trackingNumber: shipment.trackingNumber },
        update: {},
        create: shipment,
      });

      // Create sample events for each shipment
      const events = [
        {
          status: 'QUOTE_REQUESTED',
          location: shipment.origin,
          description: 'Quote requested for vehicle shipping',
          completed: true,
          shipmentId: createdShipment.id,
        },
        {
          status: 'QUOTE_APPROVED',
          location: shipment.origin,
          description: 'Quote approved and payment received',
          completed: true,
          shipmentId: createdShipment.id,
        },
        {
          status: 'PICKUP_SCHEDULED',
          location: shipment.origin,
          description: 'Vehicle pickup scheduled',
          completed: true,
          shipmentId: createdShipment.id,
        },
        {
          status: 'PICKUP_COMPLETED',
          location: shipment.origin,
          description: 'Vehicle successfully picked up',
          completed: true,
          shipmentId: createdShipment.id,
        },
        {
          status: shipment.status,
          location: shipment.currentLocation,
          description: `Vehicle is currently ${shipment.status.toLowerCase().replace('_', ' ')}`,
          completed: false,
          shipmentId: createdShipment.id,
        },
      ];

      for (const event of events) {
        await prisma.shipmentEvent.create({
          data: event,
        });
      }

      console.log(`✅ Sample shipment created: ${createdShipment.trackingNumber}`);
    }

    // Create sample quotes
    const sampleQuotes = [
      {
        vehicleType: 'suv',
        vehicleMake: 'BMW',
        vehicleModel: 'X5',
        vehicleYear: 2022,
        origin: 'San Francisco, CA',
        destination: 'Kabul, Afghanistan',
        price: 2800.00,
        status: 'PENDING',
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        notes: 'Luxury SUV shipping request',
        userId: customer.id,
      },
      {
        vehicleType: 'motorcycle',
        vehicleMake: 'Honda',
        vehicleModel: 'CBR600RR',
        vehicleYear: 2023,
        origin: 'Seattle, WA',
        destination: 'Dubai, UAE',
        price: 1200.00,
        status: 'APPROVED',
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        notes: 'Sport motorcycle shipping',
        userId: customer.id,
      },
    ];

    for (const quote of sampleQuotes) {
      await prisma.quote.create({
        data: quote,
      });
      console.log(`✅ Sample quote created for ${quote.vehicleMake} ${quote.vehicleModel}`);
    }

    // Create sample testimonials
    const sampleTestimonials = [
      {
        name: 'Ahmed Khan',
        location: 'Kabul, Afghanistan',
        rating: 5,
        content: 'Excellent service! My car arrived safely and on time. The team was very professional throughout the entire process.',
        featured: true,
        status: 'APPROVED',
      },
      {
        name: 'Fatima Zahra',
        location: 'Dubai, UAE',
        rating: 5,
        content: 'Outstanding shipping service. They handled my luxury vehicle with great care and provided regular updates.',
        featured: true,
        status: 'APPROVED',
      },
      {
        name: 'John Doe',
        location: 'New York, USA',
        rating: 4,
        content: 'Good service overall. The process was smooth and my vehicle arrived in good condition.',
        featured: false,
        status: 'APPROVED',
      },
      {
        name: 'Ali Reza',
        location: 'Herat, Afghanistan',
        rating: 5,
        content: 'Best shipping company I have used. Highly recommend for anyone shipping vehicles to Afghanistan.',
        featured: true,
        status: 'APPROVED',
      },
      {
        name: 'Sara Al-Mansoori',
        location: 'Riyadh, KSA',
        rating: 4,
        content: 'Professional service with good communication. My SUV arrived safely to Saudi Arabia.',
        featured: false,
        status: 'APPROVED',
      },
    ];

    for (const testimonial of sampleTestimonials) {
      await prisma.testimonial.create({
        data: testimonial,
      });
      console.log(`✅ Sample testimonial created for ${testimonial.name}`);
    }

    // Create sample blog posts
    const sampleBlogPosts = [
      {
        title: 'Complete Guide to Vehicle Shipping from USA to Afghanistan',
        slug: 'complete-guide-vehicle-shipping-usa-afghanistan',
        content: 'Shipping a vehicle from the USA to Afghanistan requires careful planning and understanding of international shipping regulations...',
        excerpt: 'Learn everything you need to know about shipping your vehicle from the USA to Afghanistan safely and efficiently.',
        author: 'JACXI Team',
        published: true,
        publishedAt: new Date('2024-10-01'),
        tags: ['shipping', 'guide', 'afghanistan', 'vehicle'],
        views: 1250,
      },
      {
        title: 'Top 10 Tips for Preparing Your Vehicle for International Shipping',
        slug: 'top-10-tips-preparing-vehicle-international-shipping',
        content: 'Proper preparation is crucial for successful vehicle shipping. Here are our top 10 tips to ensure your vehicle arrives safely...',
        excerpt: 'Essential tips to prepare your vehicle for international shipping and avoid common mistakes.',
        author: 'JACXI Team',
        published: true,
        publishedAt: new Date('2024-09-15'),
        tags: ['preparation', 'tips', 'shipping', 'vehicle'],
        views: 890,
      },
      {
        title: 'Understanding Vehicle Shipping Insurance: What You Need to Know',
        slug: 'understanding-vehicle-shipping-insurance',
        content: 'Vehicle shipping insurance is essential for protecting your investment during international transport...',
        excerpt: 'Everything you need to know about vehicle shipping insurance and how to choose the right coverage.',
        author: 'JACXI Team',
        published: true,
        publishedAt: new Date('2024-09-01'),
        tags: ['insurance', 'shipping', 'protection', 'vehicle'],
        views: 650,
      },
    ];

    for (const post of sampleBlogPosts) {
      await prisma.blogPost.create({
        data: post,
      });
      console.log(`✅ Sample blog post created: ${post.title}`);
    }

    // Create sample contact inquiries
    const sampleContacts = [
      {
        name: 'Mohammad Hassan',
        email: 'mohammad@example.com',
        phone: '+93 70 987 6543',
        subject: 'Vehicle Shipping Inquiry',
        message: 'I would like to get a quote for shipping my Toyota Corolla from Los Angeles to Kabul.',
        status: 'NEW',
      },
      {
        name: 'Aisha Ahmed',
        email: 'aisha@example.com',
        phone: '+971 50 123 4567',
        subject: 'SUV Shipping to Dubai',
        message: 'Need to ship my Honda CR-V from Miami to Dubai. Please provide a quote.',
        status: 'IN_PROGRESS',
      },
    ];

    for (const contact of sampleContacts) {
      await prisma.contact.create({
        data: contact,
      });
      console.log(`✅ Sample contact created for ${contact.name}`);
    }

    // Create sample newsletter subscriptions
    const sampleNewsletters = [
      {
        email: 'newsletter@example.com',
        status: 'ACTIVE',
      },
      {
        email: 'customer@example.com',
        status: 'ACTIVE',
      },
    ];

    for (const newsletter of sampleNewsletters) {
      await prisma.newsletter.create({
        data: newsletter,
      });
      console.log(`✅ Sample newsletter subscription created: ${newsletter.email}`);
    }

    console.log('🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Users: 2 (1 admin, 1 customer)`);
    console.log(`- Shipments: ${sampleShipments.length}`);
    console.log(`- Quotes: ${sampleQuotes.length}`);
    console.log(`- Testimonials: ${sampleTestimonials.length}`);
    console.log(`- Blog Posts: ${sampleBlogPosts.length}`);
    console.log(`- Contacts: ${sampleContacts.length}`);
    console.log(`- Newsletter Subscriptions: ${sampleNewsletters.length}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
  });