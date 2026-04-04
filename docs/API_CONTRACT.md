# HTTP API 契约（仓库内镜像）

| 属性 | 内容 |
|------|------|
| **版本** | v0.9 |
| **日期** | 2026-04-04 |
| **变更摘要** | 与 **`plan/product/dev/接口表-v0.md` v0.9** 对齐：**B1-4** 管理端登录与订单只读；§5 实现状态更新 |

---

## 0. 真源与同步策略

| 项 | 内容 |
|------|------|
| **产品接口表（P1-1）** | **`plan/product/dev/接口表-v0.md`** 为仓库内**主真源**；版本号与修订记录以该文件为准（见 `plan/backend/B0-5-选型与接口文档位置对齐.md`）。 |
| **飞书 / Notion** | 若存在外链，在 B0-5 §2.2 填写 URL；双写时以**负责人书面约定**或 **Git 版本号优先** 为争议裁决规则。 |
| **本文档 `docs/API_CONTRACT.md`** | 全团队可引用的**技术向汇总**：REST 约定、错误码、按模块列方法/路径/鉴权；**字段级定义见接口表**。 |
| **同步方式** | 接口表升版 → 更新本文对应章节 + 本文版本号；breaking 变更记入本文「变更记录」。 |

---

## 1. 环境与 Base Path

| 环境 | API Base（真值见 `plan/backend/B0-2-运行环境与域名.md`） |
|------|------------------------------|
| dev | `http://127.0.0.1:3000` |
| staging | `https://api-staging.example.com`（占位；**真值**与 **`miniapp/.env.staging`**、**`plan/backend/B1-5-staging部署与合法域名.md`** 一致） |
| production | `https://api.example.com`（占位） |

- **业务 API 前缀**：`/api/v1`（下文路径若写 `/orders` 即 `POST {base}/api/v1/orders`）。
- **健康检查**：`GET {base}/health`（**无** `/api/v1` 前缀）。

---

## 2. 统一响应 Envelope

与 **`plan/backend/B0-4-脚手架与健康检查.md`** §3 一致。

**成功**

| 字段 | 类型 | 说明 |
|------|------|------|
| `code` | `number` | **`0`** 成功 |
| `message` | `string` | 人类可读 |
| `data` | `object \| array \| null` | 载荷 |

**失败**

| 字段 | 类型 | 说明 |
|------|------|------|
| `code` | `number` | **业务码**（见 §4），与接口表 §7 一致 |
| `message` | `string` | 错误说明 |
| `data` | `null` | 一般为 `null` |

**HTTP 状态码（建议）**

| HTTP | 含义 |
|------|------|
| 200 | 业务成功（`code === 0`） |
| 400 | 参数错误 |
| 401 | 未登录或 token 无效 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 409 | 状态冲突（抢单/指派等） |
| 429 | 限流 |
| 500 | 服务内部错误 |

**实现说明**：当前 Nest `HttpExceptionFilter` 可能将 `code` 与 HTTP 状态混写；落地订单模块时应对齐 **接口表 §1.5**（业务码与 HTTP 分离）。

---

## 3. 鉴权

| 项 | 约定 |
|------|------|
| Header | `Authorization: Bearer <access_token>` |
| 小程序 | `POST /api/v1/auth/wechat/login` |
| 管理端 | `POST /api/v1/admin/auth/login` |
| 角色 | `player` \| `companion` \| `admin`（见接口表各接口行） |

---

## 4. 错误码表（与接口表 §7 一致）

| code | HTTP（建议） | 说明 |
|------|----------------|------|
| 0 | 200 | 成功 |
| 40001 | 400 | 参数校验失败 |
| 40101 | 401 | 未登录或 token 无效 |
| 40301 | 403 | 无权限（角色不符） |
| 40302 | 403 | 无权操作该订单 |
| 40401 | 404 | 订单不存在 |
| 40901 | 409 | 已被他人抢单/认领 |
| 40902 | 409 | 已被管理员指派 |
| 40903 | 409 | 订单状态不允许此操作 |
| 40904 | 409 | 指派违反点名规则（P0-3 §4.4） |
| 42901 | 429 | 请求过于频繁 |
| 50000 | 500 | 服务器内部错误 |

**完整与变更以接口表为准。**

---

## 5. 接口清单（镜像 · 详版见接口表）

### 5.1 健康检查（已实现）

| 方法 | 路径 | 鉴权 |
|------|------|------|
| GET | `/health` | 无 |

### 5.2 认证 / 会话

| 方法 | 路径 | 鉴权 |
|------|------|------|
| POST | `/api/v1/auth/wechat/login` | 无 |
| POST | `/api/v1/auth/logout` | Bearer |
| GET | `/api/v1/me` | Bearer |
| GET | `/api/v1/roles-demo/player` | Bearer **`player`**（演示：40301） |

### 5.3 订单（玩家 / 陪玩）

| 行为代号 | 方法 | 路径 | 鉴权 |
|----------|------|------|------|
| A | POST | `/api/v1/orders` | player |
| — | GET | `/api/v1/orders` | player |
| — | GET | `/api/v1/orders/:orderId` | player / companion（订单相关） |
| B | GET | `/api/v1/companion/orders/available` | companion |
| C | POST | `/api/v1/companion/orders/:orderId/claim` | companion |
| — | POST | `/api/v1/companion/orders/:orderId/actions` | companion |
| — | POST | `/api/v1/orders/:orderId/cancel` | player |

### 5.4 管理端

| 行为代号 | 方法 | 路径 | 鉴权 |
|----------|------|------|------|
| — | POST | `/api/v1/admin/auth/login` | 无 |
| — | GET | `/api/v1/admin/orders` | admin |
| — | GET | `/api/v1/admin/orders/:orderId` | admin |
| D | POST | `/api/v1/admin/orders/:orderId/assign` | admin |
| E | POST | `/api/v1/admin/orders/:orderId/cancel` | admin |
| E | POST | `/api/v1/admin/orders/:orderId/force-status` | admin |

**请求/响应 JSON 字段**以 **`plan/product/dev/接口表-v0.md`** §3～§6 为真源。

**实现状态（与 `server/` 对齐，可审查）**

| 接口 | 状态 |
|------|------|
| `GET /health` | 已实现 |
| `GET /api/v1/meta` | 已实现（服务元信息，非业务契约必填项） |
| `POST /api/v1/auth/wechat/login` | **已实现**（B1-1）：需 MySQL + `JWT_SECRET`；微信 **`WECHAT_MINI_*`** 或 **`WECHAT_USE_MOCK=true`** |
| `POST /api/v1/auth/logout` | **已实现**（Bearer JWT） |
| `GET /api/v1/me` | **已实现**（B1-2） |
| `GET /api/v1/roles-demo/player` | **已实现**（B1-2 角色守卫验收） |
| `POST /api/v1/orders`、`GET /api/v1/orders`、`GET /api/v1/orders/:orderId` | **已实现**（**B1-3** 草稿；抢单/取消/陪玩列表等仍待 **B2**） |
| `POST /api/v1/admin/auth/login`、`GET /api/v1/admin/orders`、`GET /api/v1/admin/orders/:orderId` | **已实现**（**B1-4**；管理端写操作仍待 **B2**） |
| 其余 §4 陪玩 claim/actions 等、§5.2～5.3 管理端写接口 | **未实现**（目标契约） |

联调前请与 **小程序 M1-3 / M1-5**、**接口表 v0.9**、管理端（若有）对测；Path 变更须同步 **三处**：代码、`plan/product/dev/接口表-v0.md`、本文。

---

## 6. 变更记录

| 版本 | 日期 | 说明 |
|------|------|------|
| v0.1 | 2026-04-05 | 初版：Envelope、错误码骨架、行为级 TODO |
| v0.2 | 2026-04-03 | 行为 D、A 点名 |
| v0.3 | 2026-04-03 | 点名字段 |
| **v0.4** | **2026-04-03** | **P1-1**：与 `接口表-v0.md` v0.4 全面对齐；Path 去 TODO；§4 增 40904 |
| **v0.5** | **2026-04-04** | **B1-1**：§5 增加实现状态表；与 `接口表-v0.md` v0.5 同步 |
| **v0.6** | **2026-04-04** | **B1-2**：§5.2 增 `/me`、`/roles-demo/player`；与 `接口表-v0.md` v0.6 同步 |
| **v0.7** | **2026-04-04** | **B1-3**：§5.3 玩家订单三条路由已实现；与 `接口表-v0.md` v0.7 同步 |
| **v0.8** | **2026-04-04** | **B1-5**：§1 staging 与 `B1-5-staging部署与合法域名.md`、小程序 env 对齐说明 |
| **v0.9** | **2026-04-04** | **B1-4**：§5.4 管理端登录与订单只读；与 `接口表-v0.md` v0.9 同步 |

---

*审查时若发现实现与本文或接口表不一致，请标出差异并提交负责人裁决后再改代码或改文档。*
