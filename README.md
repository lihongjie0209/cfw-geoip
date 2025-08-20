# Cloudflare Worker GeoIP API

基于 Cloudflare Worker 和 R2 存储的 IP 地理位置查询服务，使用 MaxMind GeoLite2 数据库。

## 功能特性

- 🌍 基于 MaxMind GeoLite2-City 数据库的精确 IP 地理位置查询
- ⚡ 使用 WebAssembly (WASM) 模块实现高性能 MMDB 文件解析
- 💾 使用 Cloudflare Cache API 缓存，避免重复下载数据库文件
- 🔄 支持自动获取客户端 IP 或指定 IP 查询
- 🌐 支持 IPv4 和 IPv6 地址
- 📊 返回详细的地理位置信息（国家、城市、坐标等）
- 🚀 全球边缘节点部署，低延迟响应
- 💾 智能缓存：数据库文件和查询结果分层缓存

## API 接口

### 查询指定 IP 地址
```
GET /{ip_address}
```

示例：
```bash
curl https://your-worker.your-subdomain.workers.dev/1.1.1.1
curl https://your-worker.your-subdomain.workers.dev/8.8.8.8
```

### 查询客户端 IP 地址
```
GET /
```

示例：
```bash
curl https://your-worker.your-subdomain.workers.dev/
```

## 响应格式

```json
{
  "ip": "1.1.1.1",
  "country": {
    "iso_code": "US",
    "name": "United States",
    "name_zh": "美国"
  },
  "city": {
    "name": "Los Angeles",
    "name_zh": "洛杉矶"
  },
  "subdivisions": [
    {
      "iso_code": "CA",
      "name": "California",
      "name_zh": "加利福尼亚州"
    }
  ],
  "location": {
    "latitude": 34.0522,
    "longitude": -118.2437,
    "accuracy_radius": 1000,
    "time_zone": "America/Los_Angeles"
  },
  "postal": {
    "code": "90013"
  },
  "continent": {
    "code": "NA",
    "name": "North America",
    "name_zh": "北美洲"
  }
}
```

## 部署前准备

### 1. 创建 R2 存储桶
```bash
wrangler r2 bucket create geo-mmd
```

### 2. 上传 GeoLite2 数据库文件
首先从 MaxMind 下载 GeoLite2-City 数据库，然后上传到 R2：

```bash
# 上传 MMDB 文件到指定路径
wrangler r2 object put geo-mmd/GeoLite2-City/latest/GeoLite2-City.mmdb --file=./GeoLite2-City.mmdb
```

### 3. 配置 wrangler.toml
更新 `wrangler.toml` 文件中的 R2 存储桶名称：

```toml
[[r2_buckets]]
binding = "GEO_BUCKET"
bucket_name = "geo-mmd"  # 确保与创建的存储桶名称一致
```

## 安装和部署

### 1. 安装依赖
```bash
npm install
```

### 2. 本地开发
```bash
npm run dev
```

### 3. 部署到生产环境
```bash
npm run deploy
```

## 配置说明

### 环境变量 (wrangler.toml)

- `MMDB_PATH`: GeoLite2 数据库在 R2 中的路径
- `CACHE_TTL`: 缓存过期时间（秒），默认 86400（24小时）

### 绑定资源

- `GEO_BUCKET`: R2 存储桶绑定，用于访问 GeoLite2 数据库

## 性能优化

1. **分层缓存策略**: 
   - 使用 Cache API 缓存 MMDB 文件，避免重复下载
   - 缓存 IP 查询结果，提高重复查询的响应速度
2. **边缘计算**: 在 Cloudflare 边缘节点执行，降低延迟
3. **HTTP 缓存**: 响应包含 Cache-Control 头，支持浏览器缓存

## 错误处理

API 会返回适当的 HTTP 状态码和错误信息：

- `400`: 无效的 IP 地址格式
- `404`: IP 地址在数据库中未找到
- `405`: 不支持的 HTTP 方法
- `500`: 服务器内部错误

## 许可证

本项目使用 MIT 许可证。注意 GeoLite2 数据库受 MaxMind 许可证约束，请遵守相关使用条款。

## 数据库更新

建议定期更新 GeoLite2 数据库以获得最新的地理位置数据。可以通过以下方式自动化更新：

1. 设置定时任务下载最新的 GeoLite2 数据库
2. 上传到 R2 存储桶的相同路径
3. Worker 会在缓存过期后自动使用新数据库
