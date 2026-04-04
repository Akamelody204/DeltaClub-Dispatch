# M1-2 · 无 token 拦截与路由守卫

> **对应任务**：小程序负责人工作计划 · Phase 1 · M1-2。  
> **目的**：无有效 **access_token**（`hasSession()` 为 false）时，**不可进入**需会话的业务页；提示「请先登录」并进入 **`/pages/auth/login`**。  
> **依据**：`M0-4-选型接口与入口规则对齐.md` §5.2（M1-2 路由守卫）；产品 **P1-4** 定稿后可微调白名单。

---

## 1. 公开页与受保护页

| 类型 | 路径 | 说明 |
|------|------|------|
| **公开** | `/pages/home/index`、`/pages/mine/index`、`/pages/auth/login` | 未登录可进；「我的」内引导登录 |
| **需登录** | `/pages/order/create`、`/pages/order/list`、`/pages/order/detail`、`/pages/companion/pending` | 见 `miniapp/src/constants/auth-routes.ts` |

新增受保护页时：加入 **`AUTH_REQUIRED_PATHS`** 并更新下表。

---

## 2. 实现要点

| 机制 | 说明 |
|------|------|
| **`uni.addInterceptor`** | 拦截 `navigateTo`、`redirectTo`、`reLaunch`、`switchTab`；命中受保护 URL 且无 session 时 `return false`，并 `navigateTo` 登录页 |
| **启动注册** | `main.ts` 首行 `import "./boot/register-auth-guards"`，保证早于页面导航 |
| **`useAuthGuardOnShow`** | 受保护页 `script setup` 中调用；兜底 **分享/开发工具直开路径**；无 token 时 **`redirectTo` 登录**（避免返回循环进无权限页） |

---

## 3. 与 M1-1 / M1-3 的边界

| 任务 | 边界 |
|------|------|
| M1-1 | 登录、storage、`request` 带 Bearer |
| **M1-2（本文）** | **路由级**无 token 不可进受保护页 |
| M1-3 | 业务请求 **401 / token 过期** 的统一处理（非「本地无 token」） |

---

## 4. 自测建议

1. 清除本地 storage 或退出登录。  
2. 点 Tab **下单 / 订单**：应 toast 并进入登录页；不应停留在下单/订单页。  
3. 首页进 **待接单**：同上。  
4. **首页、我的** 无 token 仍可进。  
5. 登录成功后，上述页可正常进入。

---

## 5. 完成标志（M1-2）

- [x] 受保护路径集中配置；拦截器 + `onShow` 兜底已接入。  
- [ ] 负责人按 §4 在真机/开发者工具勾选通过并记日期。

---

## 6. 修订记录

| 版本 | 日期 | 说明 |
|------|------|------|
| v0.1 | 2026-04-03 | 初稿：拦截器 + auth-routes + useAuthGuardOnShow |
