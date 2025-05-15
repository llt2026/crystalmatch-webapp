const fetch = require('node-fetch');

async function testBaziApi() {
  console.log('测试1989年11月2日的八字计算...');
  
  try {
    const response = await fetch('http://localhost:3000/api/test-bazi-1989');
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('八字计算结果:');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('请求错误:', error.message);
  }
}

testBaziApi(); 