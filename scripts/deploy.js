#!/usr/bin/env node

/**
 * 部署脚本 - 自动化 Cloudflare Worker 部署流程
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始部署 Cloudflare Worker GeoIP API...\n');

// 检查必要文件是否存在
const requiredFiles = [
  'wrangler.toml',
  'package.json',
  'src/index.js'
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ 缺少必要文件: ${file}`);
    process.exit(1);
  }
}

console.log('✅ 文件检查通过');

// 检查 wrangler.toml 配置
const wranglerConfig = fs.readFileSync('wrangler.toml', 'utf8');
if (!wranglerConfig.includes('GEO_BUCKET')) {
  console.warn('⚠️  警告: wrangler.toml 中未找到 R2 存储桶配置');
}

try {
  // 安装依赖
  console.log('📦 安装依赖...');
  execSync('npm install', { stdio: 'inherit' });
  
  // 检查 Wrangler 登录状态
  console.log('🔐 检查登录状态...');
  try {
    execSync('wrangler whoami', { stdio: 'pipe' });
    console.log('✅ 已登录 Cloudflare');
  } catch (error) {
    console.log('🔑 需要登录 Cloudflare...');
    execSync('wrangler login', { stdio: 'inherit' });
  }
  
  // 部署 Worker
  console.log('🚀 部署 Worker...');
  execSync('wrangler deploy', { stdio: 'inherit' });
  
  console.log('\n🎉 部署完成！');
  console.log('📖 请查看 README.md 了解如何上传 GeoLite2 数据库文件');
  console.log('💾 现在使用 Cache API 进行缓存，无需配置 KV 命名空间');
  
} catch (error) {
  console.error('❌ 部署失败:', error.message);
  process.exit(1);
}
