# Vercel 部署说明

## 必要环境变量

请在 Vercel Project Settings 里配置：

- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL`

建议 `OPENROUTER_MODEL` 与本地 `.env` 保持一致。

## 本地准备

```bash
npm install
npm test
npm run build
```

## 预览部署

```bash
npm run deploy:vercel
```

## 生产部署

```bash
npm run deploy:vercel:prod
```

## 说明

- 前端由 Vercel 托管静态 `dist/`
- `/api/analyze` 由 `api/analyze.js` 提供 Serverless Function
- 本地开发仍然使用 `vite.config.js` 中的开发中间件，但它和 Vercel 共用同一套分析服务逻辑
