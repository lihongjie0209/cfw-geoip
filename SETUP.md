# Cloudflare Worker GeoIP 配置指南

## 1. 获取 MaxMind GeoLite2 数据库

### 注册 MaxMind 账户
1. 访问 https://www.maxmind.com/en/geolite2/signup
2. 注册免费账户
3. 验证邮箱

### 下载数据库
1. 登录 MaxMind 账户
2. 前往 "My License Key" 页面创建许可密钥
3. 下载 GeoLite2-City 数据库 (MMDB 格式)

## 2. 创建 Cloudflare 资源

### 创建 R2 存储桶
```bash
wrangler r2 bucket create geo-mmd
```

### 上传数据库文件
```bash
# 解压下载的文件后，上传 .mmdb 文件
wrangler r2 object put geo-mmd/GeoLite2-City/latest/GeoLite2-City.mmdb --file=./GeoLite2-City.mmdb
```

### 创建 KV 命名空间
~~此步骤已移除 - 现在使用 Cache API 替代 KV 存储~~

## 3. 配置 wrangler.toml

确保 R2 存储桶配置正确：

```toml
[[r2_buckets]]
binding = "GEO_BUCKET"
bucket_name = "geo-mmd"  # 确保与创建的存储桶名称一致
```

## 4. 部署

```bash
# 安装依赖
npm install

# 本地开发测试
npm run dev

# 部署到生产环境
npm run deploy
```

## 5. 测试

```bash
# 使用测试脚本
npm run test https://your-worker.your-subdomain.workers.dev

# 或者手动测试
curl https://your-worker.your-subdomain.workers.dev/8.8.8.8
```

## 6. 定期更新数据库

建议每月更新 GeoLite2 数据库：

1. 从 MaxMind 下载最新数据库
2. 上传到相同的 R2 路径覆盖旧文件
3. Worker 会在缓存过期后自动使用新数据

## 常见问题

### Q: Worker 返回 "MMDB file not found" 错误
A: 检查 R2 存储桶名称和文件路径是否正确，确保文件已正确上传。

### Q: 如何自定义缓存时间？
A: 修改 wrangler.toml 中的 CACHE_TTL 变量（单位：秒）。数据库文件缓存时间由此变量控制，IP 查询结果固定缓存 1 小时。

### Q: 支持哪些 IP 格式？
A: 支持标准的 IPv4 和 IPv6 地址格式。

### Q: 如何处理大量请求？
A: Cloudflare Workers 自动扩展，Cache API 确保数据库文件和查询结果都被高效缓存。
