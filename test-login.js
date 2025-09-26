// Test login endpoint
const testLogin = async (username, password) => {
  try {
    console.log(`🔑 Testing login with username: ${username}`);
    
    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password
      }),
      credentials: 'include'
    });

    console.log(`📡 Response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login successful!');
      console.log('👤 User data:', data);
    } else {
      console.log('❌ Login failed');
      const errorText = await response.text();
      console.log('📝 Error response:', errorText);
    }
  } catch (error) {
    console.error('🚨 Network error:', error);
  }
};

// Test with admin credentials
await testLogin('palak123', 'admin123');