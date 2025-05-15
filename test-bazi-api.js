const http = require('http');
const fs = require('fs');

const data = JSON.stringify({
  birthday: '1984-09-12'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/resolve-bazi-lite',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let result = '';
  
  res.on('data', (chunk) => {
    result += chunk;
  });
  
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    
    try {
      const parsed = JSON.parse(result);
      console.log('Response:', JSON.stringify(parsed, null, 2));
      
      // 保存响应到文件
      fs.writeFileSync('bazi-response.json', JSON.stringify(parsed, null, 2));
      console.log('Response saved to bazi-response.json');
    } catch (e) {
      console.error('Failed to parse response:', e);
      console.log('Raw Response:', result);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.write(data);
req.end();

console.log('Request sent, waiting for response...'); 