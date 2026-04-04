# B1-3 · 订单表与 CRUD 草稿

> **对应任务**：`后端负责人工作计划.md` · Phase 1 · **B1-3**。  
> **目的**：`orders` 表 + 玩家侧 **创建 / 列表 / 详情**；与 **`plan/product/dev/接口表-v0.md` §4.1～4.3**、`docs/STATE_MACHINE.md` v0.1-draft、`docs/API_CONTRACT.md` **§7** 一致。  
> **非本任务**：陪玩大厅/抢单/取消/管理端（**§4.4+**、**§5**）→ **Phase 2 / B1-4**。

---

## 1. 数据模型（`server/src/order`）

| 文件 | 说明 |
|------|------|
| `order.entity.ts` | 表 **`orders`**：`playerUserId`、`companionUserId`、`skuId`、`skuSnapshot`（JSON）、`designatedCompanionUserId`、`status` 等 |
| `order-status.ts` | 状态枚举与 **`statusText`** 默认映射（与 P1-3 文案可后续替换） |

**状态**：新建单为 **`PENDING_GRAB`**（待抢单）。

**与 `docs/SCHEMA.md`**：`users.id` / `orders` 外键字段均为 **UUID 字符串**（与当前 `User` 实体一致）；若 SCHEMA 仍写 BIGINT，以 **ORM 实体为准**。

---

## 2. 已实现路由

| 方法 | Path | 鉴权 | 说明 |
|------|------|------|------|
| POST | `/api/v1/orders` | `player` | **CreateOrderBody**；点名用户须存在且 `role=companion` |
| GET | `/api/v1/orders` | `player` | `page`/`pageSize`/`status?` → **PageResult** |
| GET | `/api/v1/orders/:orderId` | **JWT** | 玩家仅本人订单；陪玩：已接单 **或** 待抢单且点名为本人 → 否则 **40302** |

---

## 3. 错误码（落地）

| code | 场景 |
|------|------|
| 40001 | 点名用户不存在、非陪玩角色等 |
| 40302 | 无权查看该订单 |
| 40401 | 订单不存在 |

---

## 4. 完成标志（B1-3）

- [x] `orders` 表可创建；玩家 CRUD 草稿与 **接口表 v0.7**、**API_CONTRACT v0.7** 同步。  
- [ ] 与小程序 **M1-3**（玩家订单列表/详情）联调通过。  
- [ ] **Phase 2**：抢单并发、状态机严格迁移、**order_logs**（总计划 Phase 2）。

---

## 5. 修订记录

| 版本 | 日期 | 说明 |
|------|------|------|
| v0.1 | 2026-04-04 | 初稿：OrdersModule、玩家三条接口 |
