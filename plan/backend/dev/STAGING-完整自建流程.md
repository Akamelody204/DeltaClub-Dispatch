# Staging 完整自建流程（原定栈）

> **目的**：从 0 到 **HTTPS API 可公网访问 + 微信 request 合法域名 + 小程序联调**，与仓库 **NestJS + MySQL（+ Redis 可选）** 一致。  
> **真源**：执行清单与 Base URL 约定以 **`B1-5-staging部署与合法域名.md`** 为准；本文是 **可照着做的分步版**，细节冲突时以 B1-5、`server/docs/DEPLOY-STAGING.md`、`B0-2-运行环境与域名.md` 为准。

---

## 1. 原定栈（自建）

| 层级 | 技术 |
|------|------|
| API | Node.js ≥ 18，NestJS；全局前缀 **`/api/v1`**；**`GET /health`** 不带此前缀 |
| 数据 | MySQL 8（staging 库建议独立，如 `clubxcx_staging`） |
| 缓存 | Redis（Phase 1 可暂不装；抢单锁 Phase 2 再上） |
| 入口 | 云主机 + **已备案域名** + HTTPS（Nginx/Caddy 终止 TLS，反代到 `127.0.0.1:PORT`） |
| 小程序 | UniApp；**`VITE_APP_API_BASE_URL`** = API **根 URL**（无尾斜杠、无 `/api/v1`） |

---

## 2. 阶段 A：资源与域名

1. **云服务器**：选主流 Linux（如 Ubuntu 22.04 LTS）；安全组放行 **22**（SSH）、**80**（证书校验）、**443**（HTTPS）。
2. **域名**：购买并完成 **ICP 备案**（国内服务器对外 API 常用要求）。
3. **DNS**：例如 `api-staging.example.com` → 服务器 **公网 IP**（A 记录，或经 LB）。
4. **证书**：Let’s Encrypt 或云厂商证书，绑定到反代 `server_name`。

---

## 3. 阶段 B：服务器依赖

1. **Node.js ≥ 18**。
2. **MySQL 8**：创建 staging 库与用户权限。
3. **（可选）Redis**、**pm2**、**git**。
4. **Nginx**（或 Caddy）：在 443 终止 TLS，反代到本机 Node。

---

## 4. 阶段 C：部署 `server/`

1. 代码上机：`git clone` / `git pull` 仓库（如 **DeltaClub-Dispatch**）。
2. 进入 `server/`，复制 **`server/.env.staging.example`** → 服务器 **`/path/to/server/.env`**（**不入库**）。
3. 至少配置：`NODE_ENV=staging`、`PORT`（与反代一致）、`DB_*`、`JWT_SECRET`、`WECHAT_MINI_APPID`、`WECHAT_MINI_SECRET`（与小程序同一 AppID；Secret 仅服务器）；`DB_SYNC` staging 建议 **`false`**（见 B1-5 §3）。**首次建表与后续改表**：本仓库 **Route A：TypeORM Migrations**（见 **`B1-6-数据库迁移与Schema演进.md`**）。若 staging 必须先上线，**临时** `DB_SYNC=true` 仅允许按 **B1-6 §4**；**首版 migration 合入后须立刻** 改回 **`DB_SYNC=false`**。
4. 构建与启动：

   ```bash
   cd server
   npm ci
   npm run build
   NODE_ENV=staging node dist/main.js
   ```

   生产态进程管理见 **`../../server/docs/DEPLOY-STAGING.md`**（pm2 等）。

5. **Nginx**：`proxy_pass http://127.0.0.1:$PORT`，并设置 `Host`、`X-Forwarded-Proto` 等（示例见 DEPLOY-STAGING §4）。
6. **自测**：

   ```bash
   curl -sS "https://<你的-staging-根域名>/health"
   ```

   期望 **200** + JSON；再验证 **`/api/v1/...`** 业务路径（如登录）经 HTTPS 可达。

---

## 5. 阶段 D：书面交付 Base URL（后端）

1. 确定 **Staging API 根**：`https://api-staging.example.com`（**无 `/api/v1`、无尾斜杠**），与 **B1-5 §0「Base URL 怎么写」** 一致。
2. 回填 **`plan/product/dev/接口表-v0.md` §1.1** staging、`B0-2-运行环境与域名.md` 占位表（若仍用占位）。
3. 群公告可复制句见 **B1-5 §7**。

---

## 6. 阶段 E：微信公众平台

1. **开发 → 开发管理 → 开发设置 → 服务器域名**。
2. **request 合法域名**：填与 Base URL **相同的根**（仅 `https://域名`，**不带路径**）；域名校验文件若需，放到根可访问路径（见 B1-5 §4）。

---

## 7. 阶段 F：小程序（UniApp）

1. 配置 **`miniapp/.env.staging`**（或团队 M0-3 约定文件）中 **`VITE_APP_API_BASE_URL`** = 上述根 URL。
2. staging 模式构建；微信开发者工具 / **真机** 验证（勿长期依赖「不校验合法域名」）。
3. 与 **M1-5**、**B1-5 §5** 第 8 条共验收。

---

## 8. 阶段 G：验收

对照 **`B1-5-staging部署与合法域名.md` §5** 执行清单 9 项逐项完成。

---

## 9. 生产环境（production）简记

- 独立域名（如 `https://api.example.com`）、独立库与密钥；流程与 staging 同构，**勿**与 staging 混库混密钥。备份与监控在 Phase 3 细化。

---

## 10. 与微信云开发 / 云托管

本流程为 **自建 NestJS + 备案域名 + request 合法域名**；不依赖微信云托管替代 Nginx/域名方案。

---

## 11. 关联文档索引

| 文档 | 路径（相对本文件） |
|------|---------------------|
| B1-5 清单与闭环 | `../B1-5-staging部署与合法域名.md` |
| B1-6 迁移与 Schema | `./B1-6-数据库迁移与Schema演进.md` |
| B0-2 三环境与域名 | `../B0-2-运行环境与域名.md` |
| 构建、反代、健康检查 | `../../../server/docs/DEPLOY-STAGING.md` |
| 环境变量键名 | `../../../server/.env.example`、`../../../server/.env.staging.example` |

---

## 12. 修订记录

| 版本 | 日期 | 说明 |
|------|------|------|
| v0.1 | 2026-04-02 | 初稿：分阶段自建流程，与 B1-5 / DEPLOY-STAGING 对齐 |
| v0.2 | 2026-04-07 | 关联 **B1-6** 迁移策略；修正 §11 相对路径 |
