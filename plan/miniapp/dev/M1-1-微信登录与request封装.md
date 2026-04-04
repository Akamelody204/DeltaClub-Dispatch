# M1-1 · 微信登录与 request 封装

> **对应任务**：小程序负责人工作计划 · Phase 1 · M1-1。  
> **目的**：`wx.login` 取 **code** → **`POST /api/v1/auth/wechat/login`** 换 **token** → **storage** 持久化；业务请求统一 **`Authorization: Bearer`**；与 **`plan/product/dev/接口表-v0.md` §3**、**`server/src/auth`** 一致。  
> **依据**：接口表 v0 · §1.6 鉴权；`../../backend/B1-1`（若存在单篇）或 `server/README.md`。

---

## 1. 工程内文件索引

| 路径 | 说明 |
|------|------|
| `miniapp/src/config/env.ts` | `API_BASE_URL`（已含 M0-3） |
| `miniapp/src/constants/storage-keys.ts` | `clubxcx_access_token` / `clubxcx_user` |
| `miniapp/src/types/auth.ts`、`types/api.ts` | `AuthSessionData`、`UserBrief`、`ApiEnvelope` |
| `miniapp/src/utils/request.ts` | 统一 `uni.request`，解析 `code===0`，返回 `data` |
| `miniapp/src/api/auth.ts` | `postWechatLogin`、`postLogout`、`getMe` |
| `miniapp/src/services/auth-session.ts` | `trySilentWechatLogin`、`loginWithWechatButton`、`persistSession`、`logoutRemote` |
| `miniapp/src/App.vue` | `onLaunch` 调 **静默登录**（无 token 时 `uni.login`） |
| `miniapp/src/pages/auth/login.vue` | 手动「微信登录」 |
| `miniapp/src/pages/mine/index.vue` | 展示登录态、跳转登录 / 退出 |

---

## 2. 请求与路径约定

- **Base**：`VITE_APP_API_BASE_URL`（无尾斜杠），如 `http://127.0.0.1:3000`。  
- **业务 path**：须带 **`/api/v1`** 前缀，例：`/api/v1/auth/wechat/login`、`/api/v1/me`。  
- **Header**：`Authorization: Bearer <accessToken>`（`request` 内 `auth: true` 时自动附加）。

---

## 3. 本地联调步骤

1. **MySQL** 起库（`server/docker-compose.yml`）。  
2. **`server/.env`**：`JWT_SECRET`、`DB_*`；无微信凭证时 **`WECHAT_USE_MOCK=true`**。  
3. `cd server && npm run start:dev` → `curl http://127.0.0.1:3000/health`。  
4. **`miniapp/.env.development`** 中 `VITE_APP_API_BASE_URL=http://127.0.0.1:3000`。  
5. 微信开发者工具：导入 **`miniapp/dist/build/mp-weixin`**（先 `npm run build:mp-weixin` 或 `dev:mp-weixin`）；**开发** 阶段可勾选「不校验合法域名」。  
6. 打开小程序 **我的** 或 **登录页**：应能完成登录并写入 token（控制台/调试条可见）。

**命令行验 token（可选）**：

```bash
curl -s -X POST http://127.0.0.1:3000/api/v1/auth/wechat/login -H "Content-Type: application/json" -d "{\"code\":\"test-code-1\"}"
```

---

## 4. 与 M1-2 的边界

| M1-1（本文） | M1-2 |
|--------------|------|
| 能登录、能带 token 请求 | **未登录不可进入受保护页**（路由守卫 / 全局前置） |

当前 **不强制** 未登录拦截，允许自由浏览 Tab（「我的」页已说明）。

---

## 5. 完成标志（M1-1）

- [x] `request` 封装 + `Bearer` + Envelope 解析。  
- [x] `uni.login` → `postWechatLogin` → `persistSession`。  
- [x] `App` 静默登录 + 登录页 + 「我的」展示会话。  
- [ ] **真机或开发者工具**与 **本地/ staging 后端**完成一次完整登录验证（负责人勾选并记日期）。  
- [ ] 若 HTTP 状态与业务码混用导致 toast 不准，在 M1-3 与后端统一过滤器行为（见接口表 §1.5）。

---

## 6. 修订记录

| 版本 | 日期 | 说明 |
|------|------|------|
| v0.1 | 2026-04-03 | 初稿：对齐接口表 §3、Nest 实现 |
