# Phase 0 结束 · 项目全貌与进入 Phase 1（M1-1）

> **目的**：在 **Phase 0 收尾** 时通览仓库，明确 **契约真源、各端位置、联调依赖**；并标记 **M1-1（微信登录 + request）** 的入口与下一步 **M1-2**。  
> **日期**：2026-04-03（随仓库演进以各 `dev/M*-*.md` 为准）。  
> **阶段公告**：Phase 0 正式收口、Phase 1 开启的全员说明见 **`../../Phase0-收口与Phase1开启.md`**。

---

## 1. 仓库结构（单仓）

| 路径 | 说明 |
|------|------|
| **`miniapp/`** | 微信小程序（uni-app + Vue3）；环境变量见 `miniapp/README.md`；Phase 0 完成 M0-1～M0-4 |
| **`server/`** | NestJS API；`GET /health`、**B1-1** 微信登录、**B1-2** 鉴权、**B1-3** 玩家订单 CRUD 草稿 |
| **`plan/`** | 总计划、各角色工作计划、**`plan/product/dev/接口表-v0.md`（接口唯一真源）** |
| **`docs/`** | `API_CONTRACT.md`、`SCHEMA.md` 等与契约/库表同步的镜像或说明 |

**管理端 PC Web**：总计划内排期，当前仓库 **无 `admin/` 目录**（未启动）。

---

## 2. 契约与范围（真源）

| 文档 | 用途 |
|------|------|
| **`plan/三角洲陪玩派单小程序-快速落实计划.md`** | 总里程碑与阶段退出标准 |
| **`plan/技术栈选型记录.md`** | 技术边界（仅微信小程序、MySQL+Redis 等） |
| **`plan/product/dev/接口表-v0.md`** | **API 路径、字段、业务码**；旧路径 `plan/product/接口表-v0.md` 仅跳转 |
| **`docs/API_CONTRACT.md`** | 接口契约镜像，与实现双向同步 |
| **`plan/product/P0-2`**、**`P0-3`**、**`P0-5`** | 派单策略、一期范围、主路径页面 |
| **`plan/miniapp/dev/M0-4-选型接口与入口规则对齐.md`** | 玩家/陪玩入口与可见性（至 P1-4 前冻结规则） |

---

## 3. 后端现状（`server/`）

| 能力 | 状态 |
|------|------|
| 健康检查 | `GET /health` |
| 微信登录 | `POST /api/v1/auth/wechat/login`（body: `{ code }`）；本地可 **`WECHAT_USE_MOCK=true`** |
| JWT、`GET /api/v1/me` | 已提供 |
| 玩家订单草稿 | `POST/GET /api/v1/orders` 等（需 **player** 角色 JWT） |

**本地联调**：`server/README.md`；MySQL 推荐 `docker compose`。

---

## 4. 小程序现状（`miniapp/`）

| Phase 0 任务 | 状态 |
|----------------|------|
| M0-1～M0-2 | tabBar、多页骨架 |
| M0-3 | `VITE_APP_API_BASE_URL`、staging 构建脚本 |
| M0-4 | 选型/接口路径/入口规则书面化 |

**Phase 1 · M1-1**：已实现 **`request` 封装**、**`uni.login` → 换 token**、**storage 持久化**、**静默登录（App onLaunch）**、**登录页与「我的」入口**；详见 **`dev/M1-1-微信登录与request封装.md`**。

---

## 5. Phase 1 推进备忘（随仓库更新）

| 序号 | 任务 | 说明 |
|------|------|------|
| 1 | **M1-2～M1-4** | 已落地时见各 **`dev/M1-x-*.md`** |
| 2 | **M1-5** | **合法域名 + staging 真机联调**：执行 **`dev/M1-5-合法域名与staging联调.md`**，与 **`../../backend/B1-5-staging部署与合法域名.md`**、**`Phase0-收口与Phase1开启.md` §4** 一致 |
| 3 | **公网 staging 未就绪时** | M1-5 完成标志可暂空；**勿**用「不校验域名」冒充真机验收 |

---

## 6. 修订记录

| 版本 | 日期 | 说明 |
|------|------|------|
| v0.1 | 2026-04-03 | Phase 0 收尾通览 + M1-1 入口说明 |
| v0.2 | 2026-04-04 | 增加与 `plan/Phase0-收口与Phase1开启.md` 的交叉引用 |
| v0.3 | 2026-04-04 | §5 更新为 Phase 1 现状 + **M1-5** 文档入口 |
