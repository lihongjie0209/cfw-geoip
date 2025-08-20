# Contributing to CFW-GeoIP

感谢你对 CFW-GeoIP 项目的贡献兴趣！

## 贡献方式

### 报告 Bug

如果你发现了 bug，请：

1. 检查 [Issues](https://github.com/lihongjie0209/cfw-geoip/issues) 确认该 bug 尚未被报告
2. 创建新的 Issue，包含：
   - Bug 的详细描述
   - 重现步骤
   - 期望的行为
   - 实际的行为
   - 环境信息（浏览器、Node.js 版本等）

### 提议新功能

1. 创建 Issue 描述你的想法
2. 等待维护者的反馈
3. 开始实现（如果被接受）

### 提交代码

1. Fork 这个仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 开发环境设置

### 前置要求

- Node.js 16+
- npm 或 yarn
- Cloudflare 账户
- Wrangler CLI

### 设置步骤

1. 克隆你的 fork
```bash
git clone https://github.com/lihongjie0209/cfw-geoip.git
cd cfw-geoip
```

2. 安装依赖
```bash
npm install
```

3. 配置环境
```bash
cp wrangler.toml.example wrangler.toml
# 编辑 wrangler.toml 配置你的 R2 存储桶
```

4. 启动开发服务器
```bash
npm run dev
```

## 代码风格

- 使用 2 空格缩进
- 使用分号
- 使用单引号
- 添加适当的注释
- 遵循现有的代码结构

## 测试

在提交 PR 之前，请确保：

1. 所有现有测试通过
```bash
npm run test
```

2. 新功能有相应的测试
3. 代码在本地开发环境中正常工作

## Pull Request 指南

### PR 标题格式

使用以下格式之一：
- `feat: 添加新功能`
- `fix: 修复 bug`
- `docs: 更新文档`
- `style: 代码格式调整`
- `refactor: 重构代码`
- `test: 添加或修改测试`
- `chore: 其他更改`

### PR 描述

请包含：
- 更改的简要描述
- 相关的 Issue 编号
- 测试说明
- 部署注意事项（如果有）

## 发布流程

1. 更新版本号在 `package.json`
2. 更新 `CHANGELOG.md`
3. 创建 Git 标签
4. 推送到 GitHub
5. 创建 GitHub Release

## 联系

如果你有任何问题，可以：
- 创建 Issue
- 在 PR 中评论
- 联系项目维护者

感谢你的贡献！🎉
