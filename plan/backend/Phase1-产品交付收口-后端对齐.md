# Phase 1 · 产品交付收口 + 各端对齐 — 后端侧说明

> **对应**：产品群发「Phase 1 产品文档（P1-1～P1-4）已在 `plan/product/dev/` 收口」中 **与后端有关** 的条目。  
> **日期**：2026-04-06（与广播同口径）。

---

## 1. 契约与真源（后端执行）

| 项 | 说明 |
|----|------|
| **接口唯一真源** | `plan/product/dev/接口表-v0.md`（含 **修订记录**）；与 `docs/API_CONTRACT.md` 交叉引用时 **以接口表为准**。 |
| **业务错误码** | 接口表 **§7**；小程序 toast 与 **`plan/product/dev/P1-2-文案包-v0.md` §5** 按 **code** 对齐。 |
| **订单状态展示** | 列表/详情 **`status` + `statusText`** 与 **`plan/product/dev/P1-3-订单状态与用户可见文案映射表-v0.md` §2** 一致；**`PENDING_GRAB`** 须结合 **`designatedCompanionUserId` 是否非空** 区分短文案（见 P1-3 §2.2 后端建议）。 |

**实现**：`server/src/order/order-status.ts` 中 **`getOrderStatusDisplayText(status, designatedCompanionUserId)`** 与 P1-3 §2 对齐；`OrdersService` 列表/详情统一经此函数填充 **`statusText`**。

---

## 2. P1-4（入口与 Tab）

真源 **`plan/product/dev/P1-4-玩家与陪玩入口及Tab分流规则-v0.md`** 主要为 **小程序路由与 Tab**；**后端无独立接口变更**。若后续某路径需新 API，仍以 **接口表** 增补为准。

---

## 3. Phase 1 领头人门禁（后端相关）

见 **`plan/Phase0-收口与Phase1开启.md` §5**，后端侧关注：

- [ ] **B1-1～B1-3、B1-5** 完成；登录与 staging 联调可验收  
- [ ] **P1-1** 与实现 **字段/路径** 无「仅口头约定」（有差异走 issue 或一次性改表）

（**M1-x、D1-1** 分别为小程序/设计门禁，本文不展开。）

**历史核对**：更细的「接口表 vs `server/`」清单见 **`P1-2-产品广播与后端对齐说明.md`** §3（含 `GET …/companion/orders/ongoing` 建议产品补表项）。

---

## 4. 可复制回复（发群）

---

**【后端】Phase 1 产品收口广播已阅。**

- 契约以 **`plan/product/dev/接口表-v0.md`** + 修订记录为准；`docs/API_CONTRACT.md` 同步维护。  
- 业务 **`code`** 与 **§7**、toast 与 **P1-2 §5** 对齐；订单 **`statusText`** 已按 **`P1-3` §2** 实现（含 **`PENDING_GRAB` × 点名**）。  
- **P1-4** 为端上入口规则，后端接口无新增真源变更。  
- **Phase 1 门禁**：推进 **B1-5** 与 **P1-1 字段一致** 核对，周会对照 **`Phase0-收口与Phase1开启.md` §5**。

---

## 5. 修订记录

| 版本 | 日期 | 说明 |
|------|------|------|
| v0.1 | 2026-04-06 | 初稿：收口广播后端要点 + `statusText` 与 P1-3 对齐说明 |
