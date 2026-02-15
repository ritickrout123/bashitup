
import { PrismaClient, BookingStatus, PaymentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Decorator Tasks...');

    // 1. Find the default decorator
    const decorator = await prisma.user.findUnique({
        where: { email: 'decorator@bashitnow.com' },
    });

    if (!decorator) {
        console.error('❌ Default decorator (decorator@bashitnow.com) not found. Run the main seed first.');
        return;
    }

    console.log(`👤 Found Decorator: ${decorator.name} (${decorator.id})`);

    // 2. Find a Theme and Customer
    const theme = await prisma.theme.findFirst();
    const customer = await prisma.user.findFirst({ where: { role: 'CUSTOMER' } });

    if (!theme || !customer) {
        console.error('❌ Theme or Customer not found.');
        return;
    }

    // 3. Create Dummy Bookings

    // Task 1: CONFIRMED (Ready to Start)
    await prisma.booking.create({
        data: {
            customerId: customer.id,
            themeId: theme.id,
            decoratorId: decorator.id,
            occasionType: 'Birthday',
            status: BookingStatus.CONFIRMED,
            date: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // Tomorrow
            startTime: '10:00 AM',
            endTime: '02:00 PM',
            guestCount: 50,
            totalAmount: 15000,
            paymentStatus: PaymentStatus.PAID,
            location: {
                address: '123 Party Lane',
                city: 'Mumbai',
                pincode: '400001',
                coordinates: { lat: 19.0760, lng: 72.8777 }
            },
            specialRequests: 'Please ensure the balloons are pastel colors only.',
        },
    });

    // Task 2: IN_PROGRESS (Setup Started)
    await prisma.booking.create({
        data: {
            customerId: customer.id,
            themeId: theme.id,
            decoratorId: decorator.id,
            occasionType: 'Anniversary',
            status: BookingStatus.IN_PROGRESS,
            date: new Date(), // Today
            startTime: '02:00 PM',
            endTime: '06:00 PM',
            guestCount: 100,
            totalAmount: 25000,
            paymentStatus: PaymentStatus.PAID,
            location: {
                address: '456 Celebration Ave',
                city: 'Delhi',
                pincode: '110001',
                coordinates: { lat: 28.6139, lng: 77.2090 }
            },
            specialRequests: 'VIP setup required near the stage.',
        },
    });

    // Task 3: COMPLETED (Done)
    await prisma.booking.create({
        data: {
            customerId: customer.id,
            themeId: theme.id,
            decoratorId: decorator.id,
            occasionType: 'Graduation',
            status: BookingStatus.COMPLETED,
            date: new Date(new Date().getTime() - 24 * 60 * 60 * 1000), // Yesterday
            startTime: '06:00 PM',
            endTime: '10:00 PM',
            guestCount: 30,
            totalAmount: 12000,
            paymentStatus: PaymentStatus.PAID,
            location: {
                address: '789 Memory Lane',
                city: 'Bangalore',
                pincode: '560001',
                coordinates: { lat: 12.9716, lng: 77.5946 }
            },
            proofOfWorkUrl: 'https://images.unsplash.com/photo-1530103862676-de3c9a59af38',
            completedAt: new Date(),
        },
    });

    console.log('✅ Created 3 dummy tasks for Decorator!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
