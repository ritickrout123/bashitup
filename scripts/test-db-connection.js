const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Connecting to database...');
        await prisma.$connect();
        console.log('Successfully connected!');
        const count = await prisma.user.count();
        console.log(`Connection verified. User count: ${count}`);
        await prisma.$disconnect();
        process.exit(0);
    } catch (e) {
        console.error('Connection failed:', e);
        await prisma.$disconnect();
        process.exit(1);
    }
}

main();
