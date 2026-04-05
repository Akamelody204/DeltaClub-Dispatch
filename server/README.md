# clubxcx-server（后端 API）

NestJS + TypeScript；**B0-4** 健康检查；**B1-1** 微信登录 + MySQL 用户表 + JWT。

## 环境

- **Node.js** ≥ 18  
- **MySQL 8**（本地推荐：在 `server/` 执行 `docker compose up -d`，见 `docker-compose.yml`）  
- 包管理：**pnpm** 或 **npm**

## 安装

```bash
cd server
npm install
```

复制环境变量：

```bash
copy .env.example .env   # Windows
# 或 cp .env.example .env
```

启动数据库后，确保 `.env` 中 `DB_*` 与 MySQL 一致。无微信凭证时可将 **`WECHAT_USE_MOCK=true`** 用于本地联调。

## 启动

```bash
npm run start:dev
```

生产：

```bash
npm run build
npm run start:prod
```

## 常用验证

| 说明 | 命令 |
|------|------|
| 健康检查 | `curl -s http://127.0.0.1:3000/health` |
| 元信息 | `curl -s http://127.0.0.1:3000/api/v1/meta` |
| 微信登录（mock） | `curl -s -X POST http://127.0.0.1:3000/api/v1/auth/wechat/login -H "Content-Type: application/json" -d "{\"code\":\"test-code-1\"}"` |
| 当前用户（需 Bearer） | `curl -s http://127.0.0.1:3000/api/v1/me -H "Authorization: Bearer <accessToken>"` |

（使用 mock 前在 `.env` 设置 `WECHAT_USE_MOCK=true`。B1-2：`GET /api/v1/roles-demo/player` 仅 `player` 可访问。）

**B1-3 订单（需 player 的 JWT）**：

```bash
curl -s -X POST http://127.0.0.1:3000/api/v1/orders -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d "{\"skuId\":\"sku-demo-1\"}"
curl -s "http://127.0.0.1:3000/api/v1/orders?page=1&pageSize=20" -H "Authorization: Bearer <token>"
curl -s http://127.0.0.1:3000/api/v1/orders/<orderId> -H "Authorization: Bearer <token>"
```

**陪玩大厅 / 进行中（需 JWT 且 `user.role = companion`，可在库中改 `users.role` 后重新登录）**：

```bash
curl -s "http://127.0.0.1:3000/api/v1/companion/orders/available?page=1&pageSize=20" -H "Authorization: Bearer <companionToken>"
curl -s "http://127.0.0.1:3000/api/v1/companion/orders/ongoing?page=1&pageSize=20" -H "Authorization: Bearer <companionToken>"
```

## 文档

- **B1-1**：`../plan/backend/dev/B1-1-微信登录与用户表.md`
- **B1-3**：`../plan/backend/dev/B1-3-订单表与CRUD草稿.md`
- **B1-4（管理端）**：`../plan/backend/dev/B1-4-管理端鉴权与占位接口.md`（配置 `ADMIN_USERNAME` + `ADMIN_PASSWORD_HASH`）  
- **B1-5（staging）**：`../plan/backend/dev/B1-5-staging部署与合法域名.md` · 技术步骤：`docs/DEPLOY-STAGING.md` · 环境模板：`.env.staging.example`
- **B1-6（迁移）**：`../plan/backend/dev/B1-6-数据库迁移与Schema演进.md` · **`docs/MIGRATIONS.md`**
- **接口契约**：`../plan/product/dev/接口表-v0.md`、`../docs/API_CONTRACT.md`
