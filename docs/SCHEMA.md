# 数据库与缓存设计（对齐用）

| 属性 | 内容 |
|------|------|
| **版本** | v0.1 |
| **日期** | 2026-04-05 |
| **变更摘要** | 初版：对齐 `plan/backend/B0-3`、总计划 §6；表结构为 Phase 0～1 **设计草案**，实现以 ORM 迁移与后端代码为准 |

---

## 0. 说明与边界

- **真源优先级**：落地后若与迁移脚本不一致，**以数据库迁移与后端实体为准**，并回写本文或记录变更原因。
- **依据**：`plan/backend/B0-3-MySQL与Redis规划.md`、`plan/技术栈选型记录.md` §2.3、总计划「核心数据与接口」。
- **字符集 / 引擎**：MySQL 8，**utf8mb4** + **utf8mb4_unicode_ci**（或团队统一 `utf8mb4_0900_ai_ci`，全项目一致），**InnoDB**，表必有主键。
- **时间**：建议 `DATETIME(3)`，语义上区分 **业务时间** 与 **写入时间**；是否统一 UTC 由后端在迁移中写死。

---

## 1. 库名（占位）

| 环境 | 库名（示例） |
|------|----------------|
| dev | `clubxcx_dev` |
| staging | `clubxcx_staging` |
| production | `clubxcx_prod` |

分环境分库或分 schema 由负责人定，**须在部署文档写死**（B0-3）。

---

## 2. 表：用户 `users`

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | `BIGINT` | PK，自增 | 内部用户 ID |
| `openid` | `VARCHAR(64)` | NOT NULL，唯一索引 `uk_users_openid` | 微信 openid |
| `unionid` | `VARCHAR(64)` | NULL，索引可选 | 微信 unionid，未绑定时 NULL |
| `role` | `TINYINT` 或 `VARCHAR(16)` | NOT NULL，索引 | 玩家 / 陪玩 / 管理员等；枚举值由后端与产品 P1-4 对齐 |
| `nickname` | `VARCHAR(64)` | NULL | 昵称 |
| `avatar_url` | `VARCHAR(512)` | NULL | 头像 URL |
| `phone` | `VARCHAR(32)` | NULL | 可选 |
| `status` | `TINYINT` | NOT NULL，默认 1 | 账号状态（正常/禁用等） |
| `created_at` | `DATETIME(3)` | NOT NULL | 创建时间 |
| `updated_at` | `DATETIME(3)` | NOT NULL | 更新时间 |

**外键**：本期可不建指向其他表的 FK，以应用层保证；若团队要求 FK，在迁移中补充。

---

## 3. 表：服务 SKU `service_skus`（一期可简化）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | `BIGINT` | PK，自增 | |
| `game_name` | `VARCHAR(64)` | NOT NULL | 如游戏名展示 |
| `region` | `VARCHAR(64)` | NULL | 区服 |
| `duration_minutes` | `INT` | NULL | 时长档位 |
| `display_price_cents` | `INT` | NOT NULL | 展示价（分），一期线下结算 |
| `sort_order` | `INT` | NOT NULL，默认 0 | 列表排序 |
| `is_active` | `TINYINT` | NOT NULL，默认 1 | 是否上架 |
| `created_at` | `DATETIME(3)` | NOT NULL | |
| `updated_at` | `DATETIME(3)` | NOT NULL | |

**说明**：一期可为固定几条种子数据；若极简 MVP 可用枚举 + 订单快照字段替代独立表，由后端在 B1-3 与接口表对齐后定稿。

---

## 4. 表：订单 `orders`

> **实现注（B1-3）**：当前后端 `User.id` / `Order.playerUserId` 等为 **UUID（char(36)）**，与下表「BIGINT」草案不一致时，**以 TypeORM 实体 `server/src/order/order.entity.ts` 为准**，并在此表后续修订中统一为 UUID。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | `BIGINT` | PK，自增 | |
| `order_no` | `VARCHAR(32)` | NOT NULL，唯一 `uk_orders_order_no` | 对外单号 |
| `player_user_id` | `BIGINT` | NOT NULL，索引 `idx_orders_player` | 玩家 `users.id` |
| `companion_user_id` | `BIGINT` | NULL，索引 `idx_orders_companion` | 接单陪玩；待抢单时为 NULL |
| `sku_id` | `BIGINT` | NULL | 关联 `service_skus.id`；若不用 SKU 表可改快照 |
| `sku_snapshot` | `JSON` 或 `VARCHAR(512)` | NULL | 下单时服务内容快照，防 SKU 变更争议 |
| `status` | `VARCHAR(32)` 或 `TINYINT` | NOT NULL，索引 `idx_orders_status` | 与 `docs/STATE_MACHINE.md` 枚举一致 |
| `remark` | `VARCHAR(500)` | NULL | 备注 |
| `cancel_reason` | `VARCHAR(200)` | NULL | 取消原因（可选） |
| `grabbed_at` | `DATETIME(3)` | NULL | 陪玩认领时间 |
| `started_at` | `DATETIME(3)` | NULL | 开始服务 |
| `finished_at` | `DATETIME(3)` | NULL | 完成 |
| `cancelled_at` | `DATETIME(3)` | NULL | 取消 |
| `created_at` | `DATETIME(3)` | NOT NULL | 下单时间 |
| `updated_at` | `DATETIME(3)` | NOT NULL | |

**索引建议**：  
- 查询玩家订单：`idx_orders_player_created` (`player_user_id`, `created_at` DESC)  
- 大厅待抢单：`idx_orders_status_created` (`status`, `created_at`) —— 具体 where 与 P0-2 抢单列表一致  

**并发**：抢单成功更新须配合 **行锁 / 乐观锁 / Redis 锁**（B0-3 §2、P0-2 §1.1），见实现文档 B2-2。

---

## 5. 表：订单操作日志 `order_logs`（Phase 2 必备，可 Phase 1 先建空表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | `BIGINT` | PK，自增 | |
| `order_id` | `BIGINT` | NOT NULL，索引 `idx_order_logs_order` | |
| `actor_type` | `VARCHAR(16)` | NOT NULL | user / admin / system |
| `actor_user_id` | `BIGINT` | NULL | 操作人；系统任务可 NULL |
| `action` | `VARCHAR(64)` | NOT NULL | 如 `STATUS_CHANGE`、`CANCEL` |
| `from_status` | `VARCHAR(32)` | NULL | |
| `to_status` | `VARCHAR(32)` | NULL | |
| `payload` | `JSON` | NULL | 扩展信息 |
| `created_at` | `DATETIME(3)` | NOT NULL | |

---

## 6. Redis 用途与 Key 设计原则

与 **B0-3** 一致；以下为**命名原则**，具体 key 在 **B2-2** 实现时写死并可在本文后续版本追加「定稿表」。

| 用途 | Phase | Key 设计原则 |
|------|-------|----------------|
| Session / Token 黑名单 | 1+ | 前缀如 `clubxcx:sess:` + `userId` 或 `jti`；TTL 与 JWT 策略一致 |
| 抢单互斥 | 2 | `clubxcx:order:lock:{orderId}` 或等价；**同一 orderId** 抢单与（若未来开放）指派进**同一互斥域**（P0-2 §1.1） |
| 限流 | 3 | 如 `clubxcx:ratelimit:{route}:{ipOrUserId}`，滑窗/令牌桶 |
| 简单队列 | 后续 | 一期不强制 |

**非目标**：Redis **不作订单主存储**；订单真相在 MySQL。

---

## 7. 变更记录

| 版本 | 日期 | 说明 |
|------|------|------|
| v0.1 | 2026-04-05 | 初版：`users` / `orders` / `service_skus` / `order_logs` 草案；Redis 节对齐 B0-3 |

---

*迁移脚本落地后，请在后端 PR 中同步修订本文字段类型与索引，或附「差异说明」。*
