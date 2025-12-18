// Simple test script to check availability API
const testAvailability = async () => {
  const baseUrl = 'http://localhost:3000';
  
  // Test dates
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  const testDates = [
    today.toISOString().split('T')[0],
    tomorrow.toISOString().split('T')[0]
  ];
  
  const testCities = ['Mumbai', 'Delhi', 'Bangalore'];
  
  console.log('🧪 Testing Availability API...\n');
  
  for (const date of testDates) {
    for (const city of testCities) {
      try {
        const url = `${baseUrl}/api/bookings/availability?date=${date}&city=${city}`;
        console.log(`📅 Testing: ${date} in ${city}`);
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
          const availableSlots = data.data.slots.filter(slot => slot.isAvailable);
          console.log(`✅ ${availableSlots.length}/${data.data.slots.length} slots available`);
          
          // Show first few available slots
          const firstThreeSlots = availableSlots.slice(0, 3);
          firstThreeSlots.forEach(slot => {
            console.log(`   🕒 ${slot.startTime} - ${slot.endTime}`);
          });
        } else {
          console.log(`❌ Error: ${data.error?.message}`);
        }
        
        console.log(''); // Empty line for readability
        
      } catch (error) {
        console.log(`❌ Network Error: ${error.message}\n`);
      }
    }
  }
};

// Instructions for manual testing
console.log(`
🎯 BOOKING FLOW TESTING GUIDE

1. Start the development server:
   npm run dev

2. Navigate to: http://localhost:3000/booking

3. Test the booking flow:
   - Select an occasion type
   - Choose a theme
   - Pick a date (today or future dates)
   - Select a city
   - Choose from available time slots
   - Fill in guest count and location
   - Complete the booking form

4. Available time slots for testing:
   - 08:00 - 12:00
   - 09:00 - 13:00
   - 10:00 - 14:00
   - 11:00 - 15:00
   - 12:00 - 16:00
   - 13:00 - 17:00
   - 14:00 - 18:00
   - 15:00 - 19:00
   - 16:00 - 20:00
   - 17:00 - 21:00
   - 18:00 - 22:00
   - 19:00 - 23:00

5. Test different scenarios:
   - Same-day booking (limited slots)
   - Weekend booking
   - Different cities
   - Various guest counts

6. Admin Dashboard Testing:
   - Login as admin: admin@bashitnow.com / admin123
   - Go to: http://localhost:3000/admin/bookings
   - View created bookings
   - Update booking status
   - Manage themes and users

📝 Note: All time slots should be available for future dates.
Same-day bookings require 2+ hours advance notice.
`);

// If running in Node.js environment, run the test
if (typeof window === 'undefined' && require.main === module) {
  testAvailability().catch(console.error);
}

module.exports = { testAvailability };