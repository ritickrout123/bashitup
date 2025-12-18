import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@bashitnow.com' },
    update: {},
    create: {
      email: 'admin@bashitnow.com',
      phone: '+919876543210',
      name: 'BashItNow Admin',
      role: 'ADMIN',
      password: hashedPassword,
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create sample decorator
  const decoratorPassword = await bcrypt.hash('decorator123', 12);
  const decorator = await prisma.user.upsert({
    where: { email: 'decorator@bashitnow.com' },
    update: {},
    create: {
      email: 'decorator@bashitnow.com',
      phone: '+919876543211',
      name: 'John Decorator',
      role: 'DECORATOR',
      password: decoratorPassword,
    },
  });

  console.log('✅ Decorator user created:', decorator.email);

  // Create addons
  const addons = [
    {
      name: 'Professional Photography',
      description: '2-hour professional photography session',
      price: 5000,
      category: 'Photography',
    },
    {
      name: 'Custom Cake',
      description: 'Personalized celebration cake',
      price: 2500,
      category: 'Food',
    },
    {
      name: 'LED String Lights',
      description: 'Warm white LED string lights',
      price: 800,
      category: 'Lighting',
    },
    {
      name: 'Balloon Arch',
      description: 'Custom color balloon arch',
      price: 1500,
      category: 'Decoration',
    },
    {
      name: 'DJ Music System',
      description: 'Professional sound system with DJ',
      price: 8000,
      category: 'Entertainment',
    },
  ];

  for (const addon of addons) {
    const existingAddon = await prisma.addon.findFirst({
      where: { name: addon.name },
    });
    
    if (!existingAddon) {
      await prisma.addon.create({
        data: addon,
      });
    }
  }

  console.log('✅ Addons created');

  // Create themes
  const themes = [
    {
      name: 'Pink Princess',
      description: 'Elegant pink and gold theme perfect for birthday celebrations',
      category: 'BIRTHDAY' as const,
      images: JSON.stringify([
        '/images/themes/pink-princess-1.jpg',
        '/images/themes/pink-princess-2.jpg',
        '/images/themes/pink-princess-3.jpg',
      ]),
      basePrice: 8000,
      setupTime: 45,
    },
    {
      name: 'Bollywood Bash',
      description: 'Vibrant Bollywood-themed decoration with colorful elements',
      category: 'BIRTHDAY' as const,
      images: JSON.stringify([
        '/images/themes/bollywood-1.jpg',
        '/images/themes/bollywood-2.jpg',
        '/images/themes/bollywood-3.jpg',
      ]),
      basePrice: 12000,
      setupTime: 60,
    },
    {
      name: 'Romantic Anniversary',
      description: 'Intimate and romantic setup for anniversary celebrations',
      category: 'ANNIVERSARY' as const,
      images: JSON.stringify([
        '/images/themes/romantic-1.jpg',
        '/images/themes/romantic-2.jpg',
        '/images/themes/romantic-3.jpg',
      ]),
      basePrice: 15000,
      setupTime: 50,
    },
    {
      name: 'Baby Shower Bliss',
      description: 'Soft pastel colors perfect for welcoming the little one',
      category: 'BABY_SHOWER' as const,
      images: JSON.stringify([
        '/images/themes/baby-shower-1.jpg',
        '/images/themes/baby-shower-2.jpg',
        '/images/themes/baby-shower-3.jpg',
      ]),
      basePrice: 10000,
      setupTime: 40,
    },
    {
      name: 'Corporate Elegance',
      description: 'Professional and sophisticated setup for corporate events',
      category: 'CORPORATE' as const,
      images: JSON.stringify([
        '/images/themes/corporate-1.jpg',
        '/images/themes/corporate-2.jpg',
        '/images/themes/corporate-3.jpg',
      ]),
      basePrice: 20000,
      setupTime: 90,
    },
    {
      name: 'Neon Night',
      description: 'Electric neon theme for modern party vibes',
      category: 'BIRTHDAY' as const,
      images: JSON.stringify([
        '/images/themes/neon-1.jpg',
        '/images/themes/neon-2.jpg',
        '/images/themes/neon-3.jpg',
      ]),
      basePrice: 18000,
      setupTime: 75,
    },
  ];

  const createdThemes = [];
  for (const theme of themes) {
    const existingTheme = await prisma.theme.findFirst({
      where: { name: theme.name },
    });
    
    if (existingTheme) {
      createdThemes.push(existingTheme);
    } else {
      const createdTheme = await prisma.theme.create({
        data: theme,
      });
      createdThemes.push(createdTheme);
    }
  }

  console.log('✅ Themes created');

  // Create portfolio items
  const portfolioItems = [
    {
      themeId: createdThemes[0].id, // Pink Princess
      title: 'Sarah\'s 25th Birthday Celebration',
      description: 'A magical pink princess themed birthday party',
      beforeImage: '/images/portfolio/before-1.jpg',
      afterImages: JSON.stringify([
        '/images/portfolio/after-1-1.jpg',
        '/images/portfolio/after-1-2.jpg',
        '/images/portfolio/after-1-3.jpg',
      ]),
      eventDate: new Date('2024-01-15'),
      location: 'Mumbai, Maharashtra',
    },
    {
      themeId: createdThemes[1].id, // Bollywood Bash
      title: 'Raj\'s Bollywood Birthday Bash',
      description: 'Vibrant Bollywood themed celebration',
      beforeImage: '/images/portfolio/before-2.jpg',
      afterImages: JSON.stringify([
        '/images/portfolio/after-2-1.jpg',
        '/images/portfolio/after-2-2.jpg',
      ]),
      eventDate: new Date('2024-02-20'),
      location: 'Delhi, India',
    },
    {
      themeId: createdThemes[2].id, // Romantic Anniversary
      title: 'Priya & Amit\'s 10th Anniversary',
      description: 'Romantic anniversary celebration setup',
      beforeImage: '/images/portfolio/before-3.jpg',
      afterImages: JSON.stringify([
        '/images/portfolio/after-3-1.jpg',
        '/images/portfolio/after-3-2.jpg',
        '/images/portfolio/after-3-3.jpg',
      ]),
      eventDate: new Date('2024-03-10'),
      location: 'Bangalore, Karnataka',
    },
  ];

  for (const item of portfolioItems) {
    const existingItem = await prisma.portfolioItem.findFirst({
      where: { title: item.title },
    });
    
    if (!existingItem) {
      await prisma.portfolioItem.create({
        data: item,
      });
    }
  }

  console.log('✅ Portfolio items created');

  // Create sample customers for testimonials
  const customers = [
    {
      email: 'priya.sharma@example.com',
      phone: '+919876543220',
      name: 'Priya Sharma',
      role: 'CUSTOMER' as const,
      password: await bcrypt.hash('customer123', 12),
    },
    {
      email: 'rajesh.kumar@example.com',
      phone: '+919876543221',
      name: 'Rajesh Kumar',
      role: 'CUSTOMER' as const,
      password: await bcrypt.hash('customer123', 12),
    },
    {
      email: 'sneha.patel@example.com',
      phone: '+919876543222',
      name: 'Sneha Patel',
      role: 'CUSTOMER' as const,
      password: await bcrypt.hash('customer123', 12),
    },
    {
      email: 'amit.gupta@example.com',
      phone: '+919876543223',
      name: 'Amit Gupta',
      role: 'CUSTOMER' as const,
      password: await bcrypt.hash('customer123', 12),
    },
    {
      email: 'kavya.reddy@example.com',
      phone: '+919876543224',
      name: 'Kavya Reddy',
      role: 'CUSTOMER' as const,
      password: await bcrypt.hash('customer123', 12),
    },
  ];

  const createdCustomers = [];
  for (const customer of customers) {
    const existingCustomer = await prisma.user.findUnique({
      where: { email: customer.email },
    });
    
    if (existingCustomer) {
      createdCustomers.push(existingCustomer);
    } else {
      const createdCustomer = await prisma.user.create({
        data: customer,
      });
      createdCustomers.push(createdCustomer);
    }
  }

  console.log('✅ Sample customers created');

  // Create sample bookings
  const sampleBookings = [
    {
      customerId: createdCustomers[0].id,
      occasionType: 'Birthday Party',
      themeId: createdThemes[0].id, // Pink Princess
      date: new Date('2024-01-15'),
      startTime: '14:00',
      endTime: '18:00',
      guestCount: 25,
      totalAmount: 12000,
      status: 'COMPLETED' as const,
      paymentStatus: 'PAID' as const,
      location: {
        address: '123 MG Road',
        city: 'Mumbai',
        pincode: '400001',
        coordinates: { lat: 19.0760, lng: 72.8777 }
      },
    },
    {
      customerId: createdCustomers[1].id,
      occasionType: 'Birthday Party',
      themeId: createdThemes[1].id, // Bollywood Bash
      date: new Date('2024-02-20'),
      startTime: '16:00',
      endTime: '20:00',
      guestCount: 40,
      totalAmount: 18000,
      status: 'COMPLETED' as const,
      paymentStatus: 'PAID' as const,
      location: {
        address: '456 CP Road',
        city: 'Delhi',
        pincode: '110001',
        coordinates: { lat: 28.6139, lng: 77.2090 }
      },
    },
    {
      customerId: createdCustomers[2].id,
      occasionType: 'Baby Shower',
      themeId: createdThemes[3].id, // Baby Shower Bliss
      date: new Date('2024-03-05'),
      startTime: '15:00',
      endTime: '19:00',
      guestCount: 30,
      totalAmount: 15000,
      status: 'COMPLETED' as const,
      paymentStatus: 'PAID' as const,
      location: {
        address: '789 Brigade Road',
        city: 'Bangalore',
        pincode: '560001',
        coordinates: { lat: 12.9716, lng: 77.5946 }
      },
    },
    {
      customerId: createdCustomers[3].id,
      occasionType: 'Anniversary',
      themeId: createdThemes[2].id, // Romantic Anniversary
      date: new Date('2024-03-20'),
      startTime: '19:00',
      endTime: '23:00',
      guestCount: 20,
      totalAmount: 20000,
      status: 'COMPLETED' as const,
      paymentStatus: 'PAID' as const,
      location: {
        address: '321 Park Street',
        city: 'Kolkata',
        pincode: '700016',
        coordinates: { lat: 22.5726, lng: 88.3639 }
      },
    },
    {
      customerId: createdCustomers[4].id,
      occasionType: 'Corporate Event',
      themeId: createdThemes[4].id, // Corporate Elegance
      date: new Date('2024-04-10'),
      startTime: '18:00',
      endTime: '22:00',
      guestCount: 100,
      totalAmount: 35000,
      status: 'COMPLETED' as const,
      paymentStatus: 'PAID' as const,
      location: {
        address: '555 IT Park',
        city: 'Hyderabad',
        pincode: '500081',
        coordinates: { lat: 17.3850, lng: 78.4867 }
      },
    },
  ];

  const createdBookings = [];
  for (const booking of sampleBookings) {
    const existingBooking = await prisma.booking.findFirst({
      where: { 
        customerId: booking.customerId,
        date: booking.date 
      },
    });
    
    if (!existingBooking) {
      const createdBooking = await prisma.booking.create({
        data: booking,
      });
      createdBookings.push(createdBooking);
    } else {
      createdBookings.push(existingBooking);
    }
  }

  console.log('✅ Sample bookings created');

  // Create testimonials
  const testimonials = [
    {
      customerId: createdCustomers[0].id,
      bookingId: createdBookings[0].id,
      rating: 5,
      comment: 'Absolutely amazing service! The team transformed our living room into a magical birthday wonderland in just 45 minutes. My daughter was over the moon! The pink princess theme was executed perfectly with attention to every detail.',
      images: JSON.stringify([
        '/images/testimonials/birthday-1-before.jpg',
        '/images/testimonials/birthday-1-after.jpg',
        '/images/testimonials/birthday-1-celebration.jpg'
      ]),
      videoUrl: '/videos/testimonials/birthday-testimonial-1.mp4',
      isPublic: true,
    },
    {
      customerId: createdCustomers[1].id,
      bookingId: createdBookings[1].id,
      rating: 5,
      comment: 'Professional, punctual, and absolutely creative! They made our Bollywood-themed birthday celebration unforgettable. The vibrant colors and decorations were exactly what we envisioned. Highly recommend BashItNow!',
      images: JSON.stringify([
        '/images/testimonials/bollywood-1-setup.jpg',
        '/images/testimonials/bollywood-1-party.jpg'
      ]),
      isPublic: true,
    },
    {
      customerId: createdCustomers[2].id,
      bookingId: createdBookings[2].id,
      rating: 4,
      comment: 'Great service and beautiful decorations for our baby shower. The pastel theme was perfect and the setup was quick. The team was very friendly and accommodating. Will definitely book again for future celebrations!',
      images: JSON.stringify([
        '/images/testimonials/baby-shower-1.jpg'
      ]),
      videoUrl: '/videos/testimonials/baby-shower-testimonial-1.mp4',
      isPublic: true,
    },
    {
      customerId: createdCustomers[3].id,
      bookingId: createdBookings[3].id,
      rating: 5,
      comment: 'Our 10th anniversary celebration was made extra special by BashItNow. The romantic setup with candles, flowers, and elegant decorations created the perfect ambiance. Thank you for making our day memorable!',
      images: JSON.stringify([
        '/images/testimonials/anniversary-1-romantic.jpg',
        '/images/testimonials/anniversary-1-couple.jpg',
        '/images/testimonials/anniversary-1-setup.jpg'
      ]),
      isPublic: true,
    },
    {
      customerId: createdCustomers[4].id,
      bookingId: createdBookings[4].id,
      rating: 5,
      comment: 'Outstanding professional service for our corporate event. The elegant setup impressed all our clients and colleagues. The team was discreet, efficient, and delivered exactly what was promised. Excellent work!',
      images: JSON.stringify([
        '/images/testimonials/corporate-1-elegant.jpg',
        '/images/testimonials/corporate-1-professional.jpg'
      ]),
      isPublic: true,
    },
  ];

  for (const testimonial of testimonials) {
    const existingTestimonial = await prisma.testimonial.findUnique({
      where: { bookingId: testimonial.bookingId },
    });
    
    if (!existingTestimonial) {
      await prisma.testimonial.create({
        data: testimonial,
      });
    }
  }

  console.log('✅ Testimonials created');

  // Create system configuration
  const systemConfigs = [
    { key: 'SITE_NAME', value: 'BashItNow' },
    { key: 'CONTACT_EMAIL', value: 'hello@bashitnow.com' },
    { key: 'CONTACT_PHONE', value: '+91-9876543210' },
    { key: 'SERVICE_CITIES', value: 'Mumbai,Delhi,Bangalore,Hyderabad,Chennai,Kolkata,Pune,Ahmedabad' },
    { key: 'MIN_BOOKING_HOURS', value: '24' },
    { key: 'MAX_BOOKING_DAYS', value: '90' },
    { key: 'DEFAULT_SETUP_TIME', value: '60' },
    { key: 'CURRENCY', value: 'INR' },
    { key: 'TAX_RATE', value: '18' }, // GST rate
    { key: 'years_in_business', value: '3' },
    { key: 'cities_served', value: '12' },
    { key: 'average_setup_time', value: '60' },
  ];

  for (const config of systemConfigs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: { value: config.value },
      create: config,
    });
  }

  console.log('✅ System configuration created');

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });