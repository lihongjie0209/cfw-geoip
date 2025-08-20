# MaxMind 库使用说明

## 关于 MaxMind 库 v5.0.0

本项目使用 `maxmind` 库的最新版本（v5.0.0），这是一个专为 Node.js 和现代 JavaScript 环境优化的 MaxMind 数据库读取器。

### 库特性

1. **现代化架构**：
   - 使用 ES modules 和现代 JavaScript 特性
   - 支持 TypeScript
   - 优化的内存使用和性能

2. **WebAssembly 兼容**：
   - 在 Cloudflare Workers 环境中运行良好
   - 无需额外的 Node.js 特定依赖
   - 支持 ArrayBuffer 输入

3. **高性能**：
   - 内置 LRU 缓存机制
   - 快速的 IP 查找算法
   - 优化的内存管理

4. **完整兼容性**：
   - 支持所有 MaxMind 数据库格式
   - 完整的 GeoLite2 和 GeoIP2 支持
   - 标准的 MaxMind API

## API 使用

### 导入和初始化
```javascript
import { open as openMaxMind } from 'maxmind';

// 从 ArrayBuffer 创建 Reader
const reader = await openMaxMind(mmdbArrayBuffer);
```

### 查询 IP
```javascript
const result = reader.get('1.1.1.1');
console.log(result);
```

### 返回数据格式
```javascript
{
  country: {
    iso_code: "US",
    names: {
      en: "United States",
      "zh-CN": "美国"
    }
  },
  city: {
    names: {
      en: "Los Angeles",
      "zh-CN": "洛杉矶"
    }
  },
  subdivisions: [{
    iso_code: "CA",
    names: {
      en: "California",
      "zh-CN": "加利福尼亚州"
    }
  }],
  location: {
    latitude: 34.0522,
    longitude: -118.2437,
    accuracy_radius: 1000,
    time_zone: "America/Los_Angeles"
  },
  postal: {
    code: "90013"
  },
  continent: {
    code: "NA",
    names: {
      en: "North America",
      "zh-CN": "北美洲"
    }
  }
}
```

## 性能优化

### 1. Reader 实例重用
```javascript
// 全局变量存储 Reader 实例，避免重复创建
let maxmindReader = null;

async function getReader(mmdbData) {
  if (!maxmindReader) {
    maxmindReader = await openMaxMind(mmdbData);
  }
  return maxmindReader;
}
```

### 2. 内置缓存
MaxMind 库内置了 LRU 缓存机制，会自动缓存查询结果，提高重复查询的性能。

### 3. 内存管理
- 使用 ArrayBuffer 而非 Buffer，更适合 Web 环境
- 优化的内存分配策略
- 支持大型数据库文件的高效加载

## 错误处理

### 常见错误类型
```javascript
try {
  const result = reader.get(ip);
  if (!result) {
    // IP 在数据库中未找到
    console.log('IP not found in database');
  }
} catch (error) {
  if (error.message.includes('Invalid IP')) {
    // 无效的 IP 地址格式
  } else if (error.message.includes('Database')) {
    // 数据库相关错误
  } else {
    // 其他错误
  }
}
```

### 最佳实践
1. **验证 IP 格式**：
```javascript
function isValidIP(ip) {
  const ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6 = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4.test(ip) || ipv6.test(ip);
}
```

2. **处理多语言名称**：
```javascript
function getLocalizedName(names, language = 'en') {
  return names?.[language] || names?.en || null;
}

const countryName = getLocalizedName(result.country?.names, 'zh-CN');
```

3. **安全访问嵌套属性**：
```javascript
const latitude = result.location?.latitude;
const cityName = result.city?.names?.en;
```

## 依赖信息

### 核心依赖
- `mmdb-lib`: ^3.0.1 - 底层 MMDB 文件解析器
- `tiny-lru`: ^11.3.4 - 轻量级 LRU 缓存实现

### 兼容性
- ✅ Cloudflare Workers
- ✅ Node.js 16+
- ✅ Modern Browsers
- ✅ Deno
- ✅ Bun

## 性能基准

在 Cloudflare Workers 环境中的典型性能表现：

| 操作 | 时间 | 备注 |
|------|------|------|
| 初始化 Reader | ~50ms | 仅首次，后续复用 |
| IP 查询（缓存命中） | ~1ms | 内置 LRU 缓存 |
| IP 查询（缓存未命中） | ~5ms | 从数据库查询 |
| 内存使用 | ~20MB | 包含缓存数据 |

## 故障排除

### Q: Worker 启动时内存不足
A: 考虑升级到付费的 Workers 计划，或优化缓存策略。

### Q: 查询某些 IP 返回 null
A: 检查数据库版本和 IP 格式，某些私有 IP 不在公共数据库中。

### Q: 性能较慢
A: 确保 Reader 实例被正确重用，检查缓存配置。

### Q: 中文名称显示问题
A: 确保使用正确的语言代码（'zh-CN' 而非 'zh'）。
