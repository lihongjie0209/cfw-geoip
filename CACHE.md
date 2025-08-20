# Cache API 使用说明

本项目使用 Cloudflare Workers 的 Cache API 来替代 KV 存储进行缓存，提供更好的性能和更简单的配置。

## Cache API 优势

### 相比 KV 存储的优势：
1. **无需额外配置**：不需要创建和配置 KV 命名空间
2. **更高性能**：Cache API 是 Workers 的内置功能，响应更快
3. **自动地理分布**：缓存自动分布到全球边缘节点
4. **HTTP 语义**：支持标准的 HTTP 缓存控制头
5. **免费使用**：无额外费用，包含在 Workers 套餐中

## 缓存策略

### 1. MMDB 数据库文件缓存
- **缓存键**: `https://cache.internal/mmdb/geolite2-city`
- **缓存时间**: 由 `CACHE_TTL` 环境变量控制（默认 24 小时）
- **存储内容**: 完整的 MaxMind GeoLite2-City.mmdb 文件
- **缓存策略**: 长期缓存，减少 R2 访问

### 2. IP 查询结果缓存
- **缓存键**: `https://cache.internal/ip/{ip_address}`
- **缓存时间**: 1 小时（固定）
- **存储内容**: IP 地理位置查询的 JSON 结果
- **缓存策略**: 短期缓存，提高重复查询性能

## 缓存管理

### 自动缓存失效
- Cache API 会根据设置的 `max-age` 自动处理缓存失效
- 无需手动清理过期缓存

### 缓存更新
- 当 R2 中的 MMDB 文件更新时，旧缓存会在 TTL 到期后自动失效
- 新的查询会自动获取最新的数据库文件

### 缓存监控
通过 Worker 日志可以监控缓存使用情况：
- `"Using cached MMDB data"` - 使用了缓存的数据库文件
- `"Cache miss, fetching MMDB from R2"` - 缓存未命中，从 R2 获取
- `"Using cached result for IP: x.x.x.x"` - 使用了缓存的 IP 查询结果

## 性能优化建议

### 1. 合理设置缓存时间
```toml
# wrangler.toml
[vars]
CACHE_TTL = "86400"  # 24小时，可根据数据更新频率调整
```

### 2. 监控缓存命中率
- 通过 `wrangler tail` 命令查看实时日志
- 观察缓存命中和未命中的比例

### 3. 预热缓存
可以在部署后主动访问一些常用 IP 来预热缓存：
```bash
curl https://your-worker.workers.dev/8.8.8.8
curl https://your-worker.workers.dev/1.1.1.1
```

## 故障处理

### 缓存访问失败
如果 Cache API 访问失败，Worker 会：
1. 记录警告日志
2. 直接从 R2 获取数据
3. 继续正常服务

### 清理缓存
如果需要强制更新缓存，可以：
1. 修改 `MMDB_PATH` 环境变量
2. 重新部署 Worker
3. 或等待 TTL 自然过期

## 成本对比

| 功能 | KV 存储 | Cache API |
|------|---------|-----------|
| 配置复杂度 | 需要创建命名空间 | 无需配置 |
| 费用 | 按使用量计费 | 包含在 Workers 中 |
| 性能 | 优秀 | 更优秀 |
| 全球分布 | 支持 | 自动支持 |
| 管理复杂度 | 中等 | 低 |

## 最佳实践

1. **监控日志**：定期检查缓存命中率
2. **合理设置 TTL**：平衡数据新鲜度和性能
3. **错误处理**：确保缓存失败时的降级策略
4. **测试**：定期测试缓存行为是否符合预期
