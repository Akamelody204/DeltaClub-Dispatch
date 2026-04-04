# M0-3 · 环境切换与 baseURL

> **对应任务**：小程序负责人工作计划 · Phase 0 · M0-3。  
> **目的**：约定 **dev / staging / production** 下 **API baseURL** 与 **调试日志开关** 的一键切换方式；**`.env*` 不提交敏感信息**，本机差异用 **`.local` 覆盖**。  
> **关联**：`../../backend/B0-2-运行环境与域名.md`（域名占位与 HTTPS 约束）；`M0-2-tabBar与页面路由骨架.md`（构建产物路径）。  
> **依据**：`../../三角洲陪玩派单小程序-快速落实计划.md` Phase 0；`../小程序负责人工作计划.md` M0-3、§1 总原则。

---

## 1. 技术选型（本任务锁定）

| 项 | 结论 |
|----|------|
| **注入方式** | **Vite 环境文件**：`.env.[mode]` + 可选 `.env.[mode].local` |
| **暴露前缀** | 仅 **`VITE_*`** 会注入客户端；**禁止**将密钥写入 `VITE_*` |
| **代码入口** | `miniapp/src/config/env.ts` 导出 `API_BASE_URL`、`APP_ENV`、`DEBUG_LOG` |
| **调试输出** | `miniapp/src/utils/debugLog.ts`；`App.vue` 启动时打印一行；**`DEBUG_LOG` 为 true 时「我的」页展示环境条**（生产构建为 false，不展示） |

---

## 2. 环境文件清单

| 文件 | 是否提交仓库 | 用途 |
|------|----------------|------|
| `.env.example` | 是 | 变量说明与复制模板 |
| `.env.development` | 是 | 本地 dev：`127.0.0.1:3000` 等 |
| `.env.staging` | 是 | 预发占位域名，与 B0-2 一致，域名就绪后替换 |
| `.env.production` | 是 | 生产占位域名，上线前替换 |
| `.env.*.local` | **否**（gitignore） | 个人本机覆盖，可写内网 IP |

---

## 3. npm scripts 与 mode 对应关系

| 命令 | Vite mode | 加载顺序（节选） |
|------|-----------|------------------|
| `npm run dev:mp-weixin` | `development` | `.env`、`.env.development`、`.env.development.local` |
| `npm run build:mp-weixin` | `production` | `.env`、`.env.production`、`.env.production.local` |
| `npm run build:mp-weixin:staging` | `staging` | `.env`、`.env.staging`、`.env.staging.local` |

---

## 4. 变量约定

| 变量 | 说明 |
|------|------|
| `VITE_APP_API_BASE_URL` | 后端 **根** URL，**无尾斜杠**；M1-1 `request` 封装将拼接具体 path |
| `VITE_APP_ENV` | 逻辑标签，与 mode 保持一致，供界面/日志区分 |
| `VITE_APP_DEBUG_LOG` | `true` / `false`；**production 文件内必须为 false** |

---

## 5. 与后端的衔接

| 事项 | 说明 |
|------|------|
| 域名真值 | 由负责人在 B0-2 占位表替换后，同步修改 `.env.staging` / `.env.production` 或使用 `.local` |
| 微信后台 | **request 合法域名** 仅配置 **HTTPS 根域**；本地 HTTP 调试依赖开发者工具「不校验合法域名」（仅开发） |
| M1-5 | 详见 **`M1-5-合法域名与staging联调.md`**；与 **`../../backend/B1-5-staging部署与合法域名.md`** 协同 |

---

## 6. 完成标志（M0-3）

- [x] `.env.example` 与三份模式 `.env.*` 已落库，含义与 B0-2 占位一致。  
- [x] `.gitignore` 已忽略 `.env.local`、`.env.*.local`。  
- [x] `src/config/env.ts` 提供 `API_BASE_URL`、`APP_ENV`、`DEBUG_LOG`。  
- [x] `npm run build:mp-weixin` 与 `npm run build:mp-weixin:staging` 均可成功构建。  
- [x] `miniapp/README.md` 含环境变量与命令说明。  
- [ ] 真实 staging/production 域名确定后，更新对应 `.env` 或 **`.env.staging.local`**（**M1-5** 验收勾选）。

---

## 7. 修订记录

| 版本 | 日期 | 说明 |
|------|------|------|
| v0.1 | 2026-04-03 | 初稿：Vite 三环境、staging 构建脚本、config/env、debugLog、我的页调试条 |
