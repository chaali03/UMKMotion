// Debug script to test OTP API
async function testOTP() {
  try {
    console.log('🔍 Testing OTP API...');
    
    const requestBody = {
      email: 'test@example.com',
      ttlSeconds: 600,
      subject: 'Test OTP'
    };
    
    console.log('📤 Request body:', JSON.stringify(requestBody));
    
    const response = await fetch('http://localhost:4321/api/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('📊 Response body (raw):', text);
    
    try {
      const json = JSON.parse(text);
      console.log('📊 Response JSON:', json);
    } catch (e) {
      console.log('❌ Failed to parse JSON:', e.message);
    }
    
  } catch (error) {
    console.error('❌ Fetch error:', error);
  }
}

// Also test with a simple GET to see if server is running
async function testServer() {
  try {
    console.log('🔍 Testing server availability...');
    const response = await fetch('http://localhost:4321/');
    console.log('🏠 Homepage status:', response.status);
  } catch (error) {
    console.error('❌ Server not reachable:', error.message);
  }
}

async function runTests() {
  await testServer();
  console.log('---');
  await testOTP();
}

runTests();
