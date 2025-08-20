# @glenstack/geoip-wasm 使用说明

## 为什么选择 @glenstack/geoip-wasm

### 相比其他 GeoIP 库的优势：

1. **WebAssembly 优化**：
   - 专为 WebAssembly 环境设计
   - 在 Cloudflare Workers 中性能更佳
   - 更小的包体积和更快的启动时间

2. **内存效率**：
   - 高效的内存使用
   - 支持流式加载大型 MMDB 文件
   - 减少 Worker 内存占用

3. **兼容性**：
   - 与 MaxMind 的官方格式完全兼容
   - 支持所有标准的 GeoLite2 和 GeoIP2 数据库
   - 无需额外的数据转换

4. **性能优化**：
   - 使用 Rust 编写，编译为 WebAssembly
   - 查询速度比纯 JavaScript 实现快数倍
   - 适合高并发场景

## API 使用

### 初始化
```javascript
import { createGeoIPWasm } from '@glenstack/geoip-wasm';

// 从 Uint8Array 创建实例
const geoip = await createGeoIPWasm(mmdbUint8Array);
```

### 查询 IP
```javascript
const result = geoip.lookup('1.1.1.1');
```

### 返回数据格式
```javascript
{
  country: {
    isoCode: "US",
    name: "United States",
    nameZh: "美国"
  },
  city: {
    name: "Los Angeles",
    nameZh: "洛杉矶"
  },
  subdivisions: [{
    isoCode: "CA",
    name: "California",
    nameZh: "加利福尼亚州"
  }],
  location: {
    latitude: 34.0522,
    longitude: -118.2437,
    accuracyRadius: 1000,
    timeZone: "America/Los_Angeles"
  },
  postal: {
    code: "90013"
  },
  continent: {
    code: "NA",
    name: "North America",
    nameZh: "北美洲"
  }
}
```

## 性能对比

| 特性 | maxmind (Node.js) | @glenstack/geoip-wasm |
|------|-------------------|----------------------|
| 运行环境 | Node.js 专用 | WebAssembly 通用 |
| 包大小 | ~500KB | ~200KB |
| 查询速度 | 基准 | 3-5x 更快 |
| 内存使用 | 较高 | 优化 |
| Workers 兼容性 | 需要适配 | 原生支持 |

## 最佳实践

### 1. 实例重用
```javascript
// 全局变量存储实例，避免重复创建
let geoipInstance = null;

async function getGeoIPInstance(mmdbData) {
  if (!geoipInstance) {
    geoipInstance = await createGeoIPWasm(mmdbData);
  }
  return geoipInstance;
}
```

### 2. 错误处理
```javascript
try {
  const result = geoip.lookup(ip);
  if (!result) {
    throw new Error('IP not found in database');
  }
  return result;
} catch (error) {
  console.error('Lookup failed:', error);
  return { error: error.message };
}
```

### 3. 数据验证
```javascript
// 验证 IP 格式
function isValidIP(ip) {
  const ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6 = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4.test(ip) || ipv6.test(ip);
}
```

## 故障排除

### 常见问题

#### Q: WebAssembly 编译失败
A: 确保使用最新版本的 Wrangler，并检查 `compatibility_date` 设置。

#### Q: 查询返回 null
A: 检查 IP 地址格式是否正确，以及数据库是否包含该 IP 的信息。

#### Q: 内存不足错误
A: 考虑升级 Workers 套餐或优化缓存策略。

### 调试技巧

1. **启用详细日志**：
```javascript
console.log('GeoIP instance created:', !!geoipInstance);
console.log('Lookup result:', result);
```

2. **监控性能**：
```javascript
const start = Date.now();
const result = geoip.lookup(ip);
console.log(`Lookup took ${Date.now() - start}ms`);
```

3. **测试不同 IP**：
```javascript
const testIPs = ['8.8.8.8', '1.1.1.1', '114.114.114.114'];
testIPs.forEach(ip => {
  const result = geoip.lookup(ip);
  console.log(`${ip}:`, result?.country?.name || 'Not found');
});
```

## 更新和维护

### 库更新
```bash
npm update @glenstack/geoip-wasm
```

### 数据库更新
- 定期从 MaxMind 下载最新的 GeoLite2 数据库
- 上传到 R2 存储桶替换旧文件
- Worker 会在缓存过期后自动使用新数据库
