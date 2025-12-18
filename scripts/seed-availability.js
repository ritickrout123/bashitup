const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedAvailability() {
  console.log('🕒 Seeding availability data for testing...');

  // Create availability for the next 30 days
  const today = new Date();
  const availabilityData = [];

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Skip past dates
    if (date < today) continue;

    // Time slots for each day
    const timeSlots = [
      { start: '08:00', end: '12:00' },
      { start: '09:00', end: '13:00' },
      { start: '10:00', end: '14:00' },
      { start: '11:00', end: '15:00' },
      { start: '12:00', end: '16:00' },
      { start: '13:00', end: '17:00' },
      { start: '14:00', end: '18:00' },
      { start: '15:00', end: '19:00' },
      { start: '16:00', end: '20:00' },
      { start: '17:00', end: '21:00' },
      { start: '18:00', end: '22:00' },
      { start: '19:00', end: '23:00' }
    ];

    // Add each time slot for major cities
    const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune'];
    
    for (const city of cities) {
      for (const slot of timeSlots) {
        availabilityData.push({
          date: date,
          startTime: slot.start,
          endTime: slot.end,
          city: city,
          isAvailable: true,
          maxBookings: 3, // Allow up to 3 bookings per slot per city
          currentBookings: 0
        });
      }
    }
  }

  console.log(`📅 Generated ${availabilityData.length} availability slots`);
  console.log('✅ Availability seeding completed!');
  
  // Note: We're not actually storing this in the database since the API generates slots dynamically
  // This script is just to show what the data structure would look like
  
  return availabilityData;
}

// If running directly
if (require.main === module) {
  seedAvailability()
    .then(() => {
      console.log('🎉 Availability seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error seeding availability:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { seedAvailability };