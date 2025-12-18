// Simple database connection test
import { prisma } from './prisma';

export async function testDatabaseConnection() {
  try {
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`📊 Total users in database: ${userCount}`);

    const themeCount = await prisma.theme.count();
    console.log(`🎨 Total themes in database: ${themeCount}`);

    return { success: true, userCount, themeCount };
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return { success: false, error };
  } finally {
    await prisma.$disconnect();
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testDatabaseConnection();
}