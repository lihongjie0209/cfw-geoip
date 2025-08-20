#!/bin/bash

# GitHub 部署脚本
echo "🚀 准备发布 CFW-GeoIP 项目到 GitHub..."

# 检查是否已经设置了远程仓库
if ! git remote get-url origin >/dev/null 2>&1; then
    echo "❌ 请先设置 GitHub 远程仓库:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/cfw-geoip.git"
    echo "   然后重新运行此脚本"
    exit 1
fi

# 确保所有更改都已提交
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  检测到未提交的更改，正在提交..."
    git add .
    git commit -m "Update: prepare for GitHub release"
fi

# 推送到 GitHub
echo "📤 推送到 GitHub..."
git push -u origin master

echo "✅ 项目已成功推送到 GitHub!"
echo ""
echo "🔗 接下来的步骤:"
echo "   1. 访问你的 GitHub 仓库"
echo "   2. 添加仓库描述和标签"
echo "   3. 创建第一个 Release"
echo "   4. 配置 GitHub Pages (如果需要)"
echo ""
echo "📋 部署到 Cloudflare Workers:"
echo "   npm run deploy"
