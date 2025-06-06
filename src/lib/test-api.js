const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testApiConnection() {
  try {
    console.log('🧪 Testing API connection from Node.js...');
    
    const url = 'http://localhost:3001/api/customers?summary=true';
    console.log('🎯 Testing URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3002' // Simulate frontend origin
      }
    });
    
    console.log('📥 Response Status:', response.status);
    console.log('📥 Response Headers:');
    for (const [key, value] of response.headers) {
      console.log(`  ${key}: ${value}`);
    }
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ API Response Data:');
    console.log(JSON.stringify(data, null, 2));
    
    console.log('🎉 API connection test SUCCESSFUL!');
    
  } catch (error) {
    console.error('❌ API connection test FAILED:');
    console.error(error.message);
    process.exit(1);
  }
}

testApiConnection(); 