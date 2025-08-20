#!/bin/bash

# GitHub 仓库完善脚本
echo "🚀 完善 GitHub 仓库配置..."

# 添加主题标签
echo "📝 添加主题标签..."
gh repo edit --add-topic cloudflare
gh repo edit --add-topic workers
gh repo edit --add-topic geoip
gh repo edit --add-topic geolocation
gh repo edit --add-topic maxmind
gh repo edit --add-topic ip-lookup
gh repo edit --add-topic r2
gh repo edit --add-topic edge-computing
gh repo edit --add-topic serverless
gh repo edit --add-topic javascript

# 创建第一个 Release
echo "🎉 创建第一个 Release..."
gh release create v1.0.0 \
  --title "v1.0.0 - Initial Release" \
  --notes-file - <<EOF
# 🎉 CFW-GeoIP v1.0.0 - Initial Release

## ✨ Features
- IP geolocation lookup using MaxMind GeoLite2-City database
- Support for both IPv4 and IPv6 addresses  
- Integration with Cloudflare R2 for database storage
- Multi-level caching strategy using Cache API
- CORS support for cross-origin requests
- mmdb-lib integration with Buffer polyfill for Cloudflare Workers compatibility

## 🌐 API Endpoints
- \`GET /\` - Get client IP geolocation
- \`GET /{ip}\` - Get specific IP geolocation

## 🚀 Quick Start
1. Clone this repository
2. Configure R2 bucket and upload MaxMind database  
3. Deploy to Cloudflare Workers with \`npm run deploy\`

See [README.md](https://github.com/lihongjie0209/cfw-geoip#readme) for detailed setup instructions.

## 📊 Example Response
\`\`\`json
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
  "location": {
    "latitude": 34.0522,
    "longitude": -118.2437,
    "time_zone": "America/Los_Angeles"
  }
}
\`\`\`

## 🤝 Contributing
We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License
MIT License - see [LICENSE](LICENSE) file for details.
EOF

# 设置仓库的默认分支保护（可选）
echo "🔒 配置分支保护..."
gh api repos/lihongjie0209/cfw-geoip/branches/master/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":[]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1}' \
  --field restrictions=null

echo "✅ GitHub 仓库配置完成！"
echo "🔗 仓库地址: https://github.com/lihongjie0209/cfw-geoip"
