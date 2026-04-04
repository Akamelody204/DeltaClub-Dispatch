# M0-2 · tabBar 与页面路由骨架

> **对应任务**：小程序负责人工作计划 · Phase 0 · M0-2。  
> **目的**：交付**可编译运行**的微信小程序端空壳：**`pages.json` 多页路由**、**底部 tabBar（占位）**、**非 Tab 陪玩页**入口预留；与总计划 Phase 0「tabBar/页面路由骨架」及 Phase 1 玩家/陪玩骨架对齐。  
> **依据**：`../../三角洲陪玩派单小程序-快速落实计划.md` Phase 0/1；`../小程序负责人工作计划.md` M0-2、M1-3、M1-4；`../../技术栈选型记录.md` §2.1（uni-app + Vue3 可行）。

---

## 1. 技术结论（本阶段锁定）

| 项 | 结论 |
|----|------|
| **框架** | **uni-app** + **Vue 3** + **TypeScript**（与现有 `miniapp/package.json` 一致）。 |
| **目标平台** | 微信小程序：`npm run build:mp-weixin` → `dist/build/mp-weixin`。 |
| **tabBar 图标** | `src/static/tabbar/*.png`，81×81 占位图；可用 `miniapp/scripts/gen-tabbar-icons.py` 重新生成。 |

---

## 2. 页面与路由清单

| 路径 | 导航栏标题 | 是否在 tabBar | 说明 |
|------|------------|---------------|------|
| `pages/home/index` | 首页 | 是 | 启动页（`pages` 数组第一项）；玩家首页占位 |
| `pages/order/create` | 下单 | 是 | M2 对接创建订单 |
| `pages/order/list` | 订单 | 是 | M1-3/M2 列表与分页 |
| `pages/mine/index` | 我的 | 是 | M1-1 登录与个人中心 |
| `pages/companion/pending` | 待接单 | 否 | 陪玩抢单大厅占位；从首页按钮 `navigateTo` 进入（M1-4） |

**说明**：一期产品为**抢单大厅**（见产品 P0-2）；陪玩端先以**独立页**接入，后续可按产品规则改为 Tab 分流或角色切换。

---

## 3. `pages.json` 要点

- **`pages` 数组顺序**：第一项为小程序启动页，当前为 `pages/home/index`。  
- **`tabBar.list`**：四项与上表一致；`iconPath` / `selectedIconPath` 为相对应用根目录的 `static/tabbar/...`（uni-app 编译后写入微信 `app.json`）。  
- **`globalStyle.navigationBarTitleText`**：默认「三角洲俱乐部」；单页可覆盖 `style.navigationBarTitleText`。

---

## 4. 工程内文件索引

| 路径 | 说明 |
|------|------|
| `miniapp/src/pages.json` | 页面注册 + tabBar |
| `miniapp/src/pages/home/index.vue` | 首页 + 跳转陪玩待接单示例 |
| `miniapp/src/pages/order/create.vue` | 下单占位 |
| `miniapp/src/pages/order/list.vue` | 订单列表占位 |
| `miniapp/src/pages/mine/index.vue` | 我的占位 |
| `miniapp/src/pages/companion/pending.vue` | 待接单占位 |
| `miniapp/src/manifest.json` | 应用名「三角洲俱乐部」；`mp-weixin.appid` 见 M0-1 |
| `miniapp/scripts/gen-tabbar-icons.py` | 生成占位 tab 图标 |

已移除默认模板页 `pages/index/index`（避免与 `home` 重复）。

---

## 5. 本地构建与预览

```bash
cd miniapp
npm install
npm run build:mp-weixin
```

微信开发者工具 → **导入** → 选择 `miniapp/dist/build/mp-weixin` → 编译预览。

---

## 6. 与 M0-1、M0-3 的衔接

| 文档 | 衔接 |
|------|------|
| M0-1 | 填写 `manifest` 内 **AppID** 后，真机预览与后续登录调试一致。 |
| M0-3 | `baseURL`、环境切换将落在 `miniapp` 内约定文件（如 `src/config/env.ts` + README），**不**在 M0-2 阻塞。 |

---

## 7. 完成标志（M0-2）

- [x] `pages.json` 含 **4 项 tabBar** + **至少 1 个非 Tab 页面**（待接单）。  
- [x] 各占位页可切换/跳转，无运行时错误。  
- [x] `npm run build:mp-weixin` **构建成功**，`dist/build/mp-weixin` 可导入开发者工具。  
- [ ] 设计稿到位后，可按稿替换 tab 文案/图标与导航结构（记修订记录）。

---

## 8. 修订记录

| 版本 | 日期 | 说明 |
|------|------|------|
| v0.1 | 2026-04-03 | 初稿：tabBar 四页 + companion/pending + 图标生成脚本；移除默认 index 页 |
