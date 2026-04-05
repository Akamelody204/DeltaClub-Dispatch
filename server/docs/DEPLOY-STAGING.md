# Staging 部署说明（技术向）

> 与 **`plan/backend/dev/B1-5-staging部署与合法域名.md`** 配套；**密钥仅放服务器环境变量**。  
> **数据库迁移**：见 **`docs/MIGRATIONS.md`**（B1-6）；staging 须 **`DB_SYNC=false`**，部署前执行 **`migration:run`**（或 **`migration:run:dist`**）。

## 1. 数据库（首次 / 升级）

在 **`server/`** 目录、已配置 **`.env`**（或进程环境变量）且 **`DB_SYNC=false`** 时：

```bash
npm ci
npm run build
npm run migration:run:dist
```

若服务器未安装 dev 依赖，可在 CI 或本机连 staging 库执行 `npm run migration:run`（注意安全组与白名单）。

## 2. 构建与启动（最小）

```bash
cd server
npm ci
npm run build
NODE_ENV=staging node dist/main.js
```

生产态建议使用 **pm2**：

```bash
npm run build
pm2 start dist/main.js --name clubxcx-api-staging --env production
# 或在 ecosystem 中注入 env_file
```

## 3. 监听

默认 **`PORT`**（见 `.env.staging.example`），反代到 `http://127.0.0.1:$PORT`。

## 4. 健康检查

```bash
curl -sS "https://<你的-staging-根域名>/health"
```

期望：`code`、`data.status` 等与本地一致。

## 5. Nginx 反代示例（片段）

```nginx
server {
    listen 443 ssl http2;
    server_name api-staging.example.com;
    # ssl_certificate ...;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 6. 与小程序

小程序 **`VITE_APP_API_BASE_URL`** 须为 **本服务对外根 URL**（**无尾斜杠**），例如 `https://api-staging.example.com`，请求路径为 `/api/v1/...`、`/health`。
