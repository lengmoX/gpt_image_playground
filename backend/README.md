# GPT Image Playground — 后端代理服务

轻量 Node.js 代理，专为解决 `www.88code.pro` 和 `api.88code.pro` 的 CORS 问题设计。

## 安全机制

1. **目标域名白名单**：只代理 `www.88code.pro` 和 `api.88code.pro`，硬编码在 `src/config.ts`
2. **Referer 来源校验**：只接受来自前端部署域名的请求

## 快速开始（开发）

```bash
cd backend
pnpm install      # 或 npm install
cp .env.example .env
# 编辑 .env，填写 FRONTEND_ORIGIN

pnpm dev          # 启动开发服务器（端口 3001）
```

同时启动前端（另开终端）：

```bash
# 项目根目录
pnpm dev
```

然后在前端设置页面填入 `https://api.88code.pro/v1` 作为 API URL，请求将自动通过代理。

## 生产部署

### 1. 编译

```bash
cd backend
pnpm install
pnpm build        # 输出到 dist/
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env：
# PORT=3001
# FRONTEND_ORIGIN=https://your-site.com
```

### 3. 使用 PM2 启动

```bash
pm2 start dist/index.js --name gpt-proxy
pm2 save
pm2 startup
```

### 4. Nginx 配置（与前端同服务器）

```nginx
server {
    listen 443 ssl;
    server_name your-site.com;

    # 前端静态文件
    root /var/www/gpt-image-playground/dist;
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 自定义代理路由 → Node.js 后端
    location /custom-proxy/ {
        rewrite ^/custom-proxy/(.*)$ /$1 break;
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Referer $http_referer;
        proxy_set_header Origin $http_origin;
        # 支持大文件上传（图片编辑接口）
        client_max_body_size 50M;
        proxy_read_timeout 600s;
    }
}
```

## 健康检查

```bash
curl http://localhost:3001/health
# → {"status":"ok","allowedHosts":["www.88code.pro","api.88code.pro"]}
```
