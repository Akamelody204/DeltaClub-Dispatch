# 三角洲俱乐部 · 微信小程序（uni-app）

## 环境要求

- Node.js LTS
- 微信开发者工具

## 安装

```bash
npm install
```

## 环境变量（M0-3）

| 变量 | 含义 |
|------|------|
| `VITE_APP_API_BASE_URL` | 后端 API 根地址，**无尾斜杠** |
| `VITE_APP_ENV` | `development` / `staging` / `production` |
| `VITE_APP_DEBUG_LOG` | `true` 时输出调试日志并在「我的」页展示当前环境条 |

模板文件：`.env.example`。默认已提交 `.env.development`、`.env.staging`、`.env.production`（占位域名，与 `plan/backend/B0-2` 一致）。

**Staging / 合法域名（M1-5）**：公网 HTTPS staging 就绪后，将真实 API 根写入 **`.env.staging.local`**（已 gitignore），再执行 `npm run build:mp-weixin:staging`；微信公众平台 **request 合法域名** 须与 `VITE_APP_API_BASE_URL` **同根**。执行清单见 **`plan/miniapp/dev/M1-5-合法域名与staging联调.md`**，与后端 **`plan/backend/B1-5-staging部署与合法域名.md`** 协同。

**本机覆盖**：新建 `.env.development.local`（已 gitignore），例如改成本机局域网 IP，**勿**写入密钥。

**安全**：`VITE_*` 会打进小程序包，**禁止**存放 AppSecret、token。

## 常用命令

```bash
# 微信小程序 · 开发（使用 .env.development）
npm run dev:mp-weixin

# 微信小程序 · 生产构建（使用 .env.production）
npm run build:mp-weixin

# 微信小程序 · staging 构建（使用 .env.staging，联调预发 API）
npm run build:mp-weixin:staging
```

构建产物：`dist/build/mp-weixin`，用微信开发者工具导入该目录。

## 详细说明

- 环境变量：`plan/miniapp/dev/M0-3-环境切换与baseURL.md`  
- Staging + 微信合法域名：`plan/miniapp/dev/M1-5-合法域名与staging联调.md`
