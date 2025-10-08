// Use built-in fetch in Node.js 18+

async function checkSystemUsers() {
  console.log('Checking system users and testing booking visibility...\n');
  
  // Let's check for existing bookings first
  try {
    const response = await fetch('https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net/api/test/bookings');
    const data = await response.json();
    
    console.log('=== All Bookings in System ===');
    if (data.success && data.bookings) {
      console.log(`Found ${data.bookings.length} bookings:`);
      data.bookings.forEach((booking, index) => {
        console.log(`\nBooking ${index + 1}:`);
        console.log('- ID:', booking._id);
        console.log('- Number:', booking.bookingNumber || 'No number');
        console.log('- Client:', booking.client || 'No client');
        console.log('- Provider:', booking.provider || 'No provider');
        console.log('- Service:', booking.service || 'No service');
        console.log('- Status:', booking.status || 'No status');
        console.log('- Date:', booking.scheduledDate || 'No date');
      });
    } else {
      console.log('No bookings found or error:', data.message);
    }
  } catch (error) {
    console.error('Error fetching bookings:', error.message);
  }

  // Check for users
  try {
    const response = await fetch('https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net/api/test/users');
    const data = await response.json();
    
    console.log('\n=== All Users in System ===');
    if (data.success && data.users) {
      console.log(`Found ${data.users.length} users:`);
      data.users.forEach((user, index) => {
        console.log(`\nUser ${index + 1}:`);
        console.log('- ID:', user._id);
        console.log('- Name:', user.name);
        console.log('- Email:', user.email);
        console.log('- Role:', user.role);
        console.log('- Verified:', user.isEmailVerified || false);
      });
    } else {
      console.log('No users found or error:', data.message);
    }
  } catch (error) {
    console.error('Error fetching users:', error.message);
  }
}

checkSystemUsers();