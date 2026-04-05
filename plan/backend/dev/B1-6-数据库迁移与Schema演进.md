# B1-6 · 数据库迁移与 Schema 演进

> **对应任务**：`../后端负责人工作计划.md` · Phase 1 · **B1-6**（与 **B1-5 staging 落地** 强相关；表结构已非「空想」时收口）。  
> **目的**：把 **「库表怎么从 dev 长到 staging / 生产」** 写成可执行约定，与 **`B0-3`**「禁止无记录手工改生产」一致，避免长期只靠 **`synchronize: true`** 漂移。  
> **命名说明**：**B1-6** 在本仓库专指 **迁移与 Schema**；**抢单 / 取消 / 管理端写接口** 等 API 缺口见 **接口表** 与 **Phase 2 / B2-3**，勿与本文混淆。  
> **真源**：实体与列级细节以 **`server/src/**/*.entity.ts`** 与 **`docs/SCHEMA.md`**（概念）为准；二者冲突时 **以实体与线上实际表结构为准**，并回填 SCHEMA。

---

## 1. 现状（仓库）

- **TypeORM** 在 **`server/src/database/typeorm-app-options.ts`** + **`app.module.ts`** 中通过 **`DB_SYNC`** 控制 **`synchronize`**（本地默认 `true`）。
- **迁移（Route A）已落地**：**`server/src/data-source.ts`**（CLI 专用，`synchronize: false`）、**`server/src/migrations/1744000000000-BaselineSchema.ts`**（首版基线）、**`server/package.json`** 脚本（`migration:run` / `revert` / `show` / `generate` / `migration:run:dist`）。操作说明见 **`server/docs/MIGRATIONS.md`**。

---

## 2. 原则（与 B0-3 对齐）

1. **可追溯**：凡影响 **staging / production** 表结构的变更，须有 **版本化记录**（**TypeORM migration**），**禁止**仅口头或私改库。  
2. **环境隔离**：**dev** 可用 `DB_SYNC=true` 提速；**staging / prod** 常态为 **`DB_SYNC=false`**，改表走 **migration**（**§4** 过渡期除外）。  
3. **一次真源**：业务字段含义仍以 **产品接口表**、实现以 **实体** 为准；迁移脚本与实体 **同 PR 合并**，避免「脚本上了、实体没上」。

---

## 3. 策略（已定案）

**本仓库采用 Route A：`TypeORM Migrations`。**

- 不以 Flyway 式「纯编号 SQL 目录」作为默认栈；若将来改为双轨或替换策略，须 **修订本文 + 升版本号 + 站会告知**。  
- 落地要求见 **§5**（npm 脚本、迁移目录、`migration:run` 与部署顺序）。

---

## 4. 过渡期：staging 应急与截止条件

若 **staging 必须先上线**、尚来不及合入 **首版 migration**，允许 **一次性、临时** 在 **staging 环境** 使用 **`DB_SYNC=true`** 由实体拉齐表结构。

| 项 | 约定 |
|----|------|
| **允许前提** | 仅 **staging**；须书面留痕（**`B1-5`** 执行清单、部署记录或 issue）：日期、操作人、原因「首版 migration 未合入」。 |
| **截止条件（强制）** | **首版 migration 已合入主干（main）并可在 staging 执行 `migration:run` 对齐基线后**，须 **立刻** 将 staging 的 **`DB_SYNC` 改回 `false`** 并重新部署；之后表结构演进 **只** 通过 **migration**，**禁止**把 **`DB_SYNC=true`** 再当常规手段。 |
| **生产** | **禁止**以「先上线再补迁移」为由长期 **`DB_SYNC=true`**；生产默认 **仅 `DB_SYNC=false` + migration**（与首版 migration 就绪节奏对齐）。 |

**摘要**：临时 sync 是 **过渡**，不是第二套常态；**首版 migration 合入 = 切换截止点**。

---

## 5. TypeORM Migrations 落地（Route A 执行项）

- **脚本与文档**：见 **`server/docs/MIGRATIONS.md`**、**`server/package.json`**。新迁移须在 **`src/data-source.ts`** 的 **`migrations`** 数组中 **显式注册**（当前基线已注册）。  
- **staging 首次「正规」建库**：**空库 + `migration:run`（或 `migration:run:dist`）**；若曾用 **§4** 临时 sync，按 **MIGRATIONS**「曾用 DB_SYNC」处理。  
- **完成标志**：任意新表 / 新列 / 索引变更，**先 migration 再部署**（或 CI 校验失败则阻断发布）。

---

## 6. 与部署文档的衔接

- **`plan/backend/dev/B1-5-staging部署与合法域名.md`**、**`plan/backend/dev/STAGING-完整自建流程.md`**：「创建 DB、建表」须指向 **`migration:run`** 与 **§4** 过渡规则（若适用）。  
- **`server/docs/DEPLOY-STAGING.md`**：**「首次建表与后续变更」** 链到本文与 **`server/docs/MIGRATIONS.md`**。

---

## 7. Phase 分工建议

- **Phase 1（收尾）**：**Route A** 脚本与 **首版 migration** 合入；staging 按 **§4** 已用临时 sync 的，在截止条件满足后 **切回 `DB_SYNC=false`**。  
- **Phase 2+**：状态机、抢单、日志表等 **一律** 走 migration；**禁止**依赖「改实体 + sync」作为唯一手段上 **staging / 生产**。

---

## 8. 修订记录

| 版本 | 日期 | 说明 |
|------|------|------|
| v0.1 | 2026-04-07 | 初稿：现状、`DB_SYNC`、路线 A/B、与 B1-5/部署衔接 |
| v0.2 | 2026-04-07 | **策略**：明确 **Route A：TypeORM Migrations**；**过渡**：staging 临时 `DB_SYNC=true` + **首版 migration 合入后立刻** 切回 `false` |
| v0.3 | 2026-04-07 | **实现**：`data-source.ts`、**Baseline** 迁移、`package.json` 脚本、**`server/docs/MIGRATIONS.md`** |
