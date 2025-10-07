async function testServiceDetails() {
  const serviceId = '68e4feba8e248b993e547690';
  const url = `https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net/api/v2/services/${serviceId}`;
  
  console.log('Testing service details API...');
  console.log('URL:', url);
  
  try {
    const response = await fetch(url);
    console.log('Status:', response.status);
    console.log('Headers:', response.headers.get('content-type'));
    
    if (response.ok) {
      const data = await response.json();
      console.log('Response data structure:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log('Error response:', await response.text());
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

testServiceDetails();