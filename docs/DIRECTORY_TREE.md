# 仓库目录与工程约定

| 属性 | 内容 |
|------|------|
| **版本** | v0.2 |
| **日期** | 2026-04-06 |
| **变更摘要** | `server/` 已落地（NestJS + `/health`）；更新 §2 树与状态表 |

---

## 1. 仓库形态

| 项 | 结论 |
|----|------|
| **形态** | **单仓 monorepo（推荐）**：根目录下并列 **`miniapp/`**（微信小程序）、**`server/`**（后端 API）、**`admin/`**（PC 管理后台，若本期落地）。 |
| **与 B0-1** | 与 `plan/backend/B0-1-仓库与分支约定.md` 一致；一期不拆独立后端仓，除非负责人书面要求双仓。 |
| **本文档** | 描述**当前仓库实际结构** + **约定中的占位目录**；若仅部分目录已创建，以「现状」节为准。 |

---

## 2. 顶层目录（现状 + 约定）

```
clubxcx/                          # 仓库根
├── docs/                         # 技术真源（本目录）：DIRECTORY_TREE / SCHEMA / API_CONTRACT / STATE_MACHINE
├── plan/                         # 职责、里程碑、产品/后端/小程序计划（非可执行契约主真源）
│   ├── 三角洲陪玩派单小程序-快速落实计划.md
│   ├── 技术栈选型记录.md
│   ├── 领头人-开发步骤指导.md
│   ├── product/
│   ├── backend/
│   ├── miniapp/
│   └── design/
├── miniapp/                      # 【已存在】UniApp + Vue3 微信小程序工程
│   ├── package.json
│   ├── .env.example / .env.development / .env.staging / .env.production  # 环境占位（密钥不入库）
│   ├── src/                      # 页面、配置、工具（详见 miniapp/README.md）
│   └── dist/                     # 构建产物（通常不提交或按 .gitignore）
├── server/                       # 【已存在】NestJS + TS；B0-4 健康检查与统一错误体
│   ├── package.json
│   ├── .env.example
│   ├── README.md
│   ├── src/                      # main、AppModule、health（GET `/health`）、common/filters
│   └── dist/                     # 构建产物（`nest build`）
└── admin/                        # 【可选 · 规划】Vue3 + Element Plus 管理后台；无人力时可延后或由后端兼极简版
```

| 目录 | 状态（截至文档日期） | 说明 |
|------|----------------------|------|
| `docs/` | 已建立 | 全团队技术契约镜像；与 `plan/product/dev/接口表-v0.md` 等交叉引用。 |
| `plan/` | 已存在 | 各角色工作计划；**产品可执行产出**在 **`plan/product/dev/`**（P0/P1、接口表真源）；与 `docs/` 冲突时由**负责人裁定**。 |
| `miniapp/` | **已存在** | 用户端唯一小程序；环境切换见 `plan/miniapp/dev/M0-3-环境切换与baseURL.md`。 |
| `server/` | **已存在**（B0-4 可本地 `curl /health`） | 详见 `server/README.md`；数据库迁移与业务接口在 Phase 1+ 追加。 |
| `admin/` | **未创建 / 可选** | 与总计划 Phase 2 管理端一致；可与 `server` 同 monorepo 或后续加入。 |

---

## 3. 配置与环境文件位置

| 层级 | 位置 | 约定 |
|------|------|------|
| 小程序 | `miniapp/.env.*` | 例：`VITE_APP_ENV`、`VITE_APP_API_BASE_URL`（见 `miniapp/src/config/env.ts`）；**勿在 `VITE_*` 存密钥**（会进包体）；Base URL 与 `plan/backend/B0-2` 一致。 |
| 后端 | `server/.env`（本地，**不入库**） | 从 `server/.env.example` 复制；含 `PORT`、`DATABASE_*` / `DATABASE_URL`、`REDIS_*`、`WECHAT_MINI_*` 等，见 B0-2 / B0-3。 |
| 管理端 | `admin/.env`（若存在） | 与后端 API 地址、管理端登录方式一致；具体以后端与管理端 README 为准。 |

**密钥**：任何环境**禁止**将含真实 AppSecret、数据库密码的 `.env` 提交至 Git。

---

## 4. 分支与主分支（摘要）

| 分支 | 用途 |
|------|------|
| `main` | 可部署；合并前 CI/自检（与 B0-1 §2～§3 一致）。 |
| `feat/*` | 功能开发，如 `feat/b1-wechat-login`。 |
| `fix/*` | 紧急修复（按需）。 |

breaking API 须在站会或群公告显式同步（总计划 §7）。

---

## 5. 变更记录

| 版本 | 日期 | 说明 |
|------|------|------|
| v0.1 | 2026-04-05 | 初版：归纳 B0-1 monorepo；标注 `server`/`admin` 与 `miniapp` 现状 |
| v0.2 | 2026-04-06 | `server/` 已创建：NestJS、`GET /health`、`.env.example`、README |

---

*若远程仓、staging 域名或子包结构有变，请更新 §2 并递增本文版本号。*
