/**
 * 本地测试脚本
 * 用于测试 Worker 的各种功能
 */

const testIPs = [
  '1.1.1.1',      // Cloudflare DNS
  '8.8.8.8',      // Google DNS
  '114.114.114.114', // 中国 DNS
  '2001:4860:4860::8888', // Google IPv6 DNS
  'invalid-ip',   // 无效 IP 测试
];

async function testWorker(baseUrl) {
  console.log(`🧪 测试 Worker: ${baseUrl}\n`);

  // 测试默认端点（获取客户端 IP）
  console.log('📍 测试默认端点（客户端 IP）');
  try {
    const response = await fetch(baseUrl);
    const data = await response.json();
    console.log('✅ 响应:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ 错误:', error.message);
  }
  console.log();

  // 测试各种 IP 地址
  for (const ip of testIPs) {
    console.log(`🔍 测试 IP: ${ip}`);
    try {
      const response = await fetch(`${baseUrl}/${ip}`);
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ 成功:', {
          ip: data.ip,
          country: data.country?.name || 'Unknown',
          city: data.city?.name || 'Unknown',
          location: data.location ? `${data.location.latitude}, ${data.location.longitude}` : 'Unknown'
        });
      } else {
        console.log('⚠️  错误响应:', data);
      }
    } catch (error) {
      console.error('❌ 请求失败:', error.message);
    }
    console.log();
  }

  // 测试 CORS
  console.log('🌐 测试 CORS');
  try {
    const response = await fetch(baseUrl, {
      method: 'OPTIONS'
    });
    console.log('✅ CORS 预检:', response.status === 200 ? '通过' : '失败');
    console.log('CORS 头部:', {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods')
    });
  } catch (error) {
    console.error('❌ CORS 测试失败:', error.message);
  }
}

// 从命令行参数获取 Worker URL
const workerUrl = process.argv[2];

if (!workerUrl) {
  console.error('请提供 Worker URL:');
  console.error('node test.js https://your-worker.your-subdomain.workers.dev');
  process.exit(1);
}

// 运行测试
testWorker(workerUrl).catch(console.error);
