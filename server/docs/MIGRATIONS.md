# TypeORM 迁移（B1-6 · Route A）

> 策略与过渡规则见 **`plan/backend/dev/B1-6-数据库迁移与Schema演进.md`**。

## 配置文件

| 文件 | 作用 |
|------|------|
| **`src/data-source.ts`** | TypeORM CLI 使用的 `DataSource`（**`synchronize: false`**）；从**项目根 `server/`** 加载 `.env`。 |
| **`src/database/typeorm-app-options.ts`** | Nest 运行时配置（含 **`DB_SYNC`**），与 `data-source` **共用实体列表** `TYPEORM_ENTITIES`。 |
| **`src/migrations/*.ts`** | 迁移类；**新增迁移**须在 `data-source.ts` 的 `migrations` 数组中 **显式注册**（本项目采用显式列表，避免 glob 歧义）。 |

## npm 脚本（在 `server/` 下执行）

| 脚本 | 说明 |
|------|------|
| **`npm run migration:show`** | 查看已执行 / 待执行迁移（需 MySQL 可连）。 |
| **`npm run migration:run`** | 执行未跑的迁移。 |
| **`npm run migration:revert`** | 回滚上一支迁移。 |
| **`npm run migration:generate`** | 对**当前库**与实体做 diff 生成迁移；**须**自行审 diff，并注册到 `data-source.ts`。用法示例：`npm run migration:generate -- src/migrations/1731000000000-AddFoo` |
| **`npm run migration:run:dist`** | 使用 **编译后** `dist/data-source.js`（先 `npm run build`)；适合服务器仅装 Node、不装 ts-node 的场景。 |

CLI 使用 **`typeorm-ts-node-commonjs`**，依赖 **`ts-node`**（见 `package.json`）。

## 首版基线

- **`src/migrations/1744000000000-BaselineSchema.ts`**：创建 **`users`**、**`orders`**，与当前实体一致。  
- **空库**：`DB_SYNC=false`，执行 **`migration:run`** 即可建表。  
- **曾用 `DB_SYNC=true` 的库**：须按 **B1-6 §4** 在首版 migration 合入后改回 `false`；若表已存在，**不要**对同一库重复执行会冲突的 `up`（需 DBA/负责人决定 **dump 对齐** 或 **新库**）。

## 生产 / staging 建议顺序

1. 配置环境变量（**`DB_SYNC=false`**）。  
2. `npm ci && npm run build`  
3. `npm run migration:run:dist`（或在本机 `migration:run` 连远程库，视安全策略而定）。  
4. 启动进程：`node dist/main.js` / pm2。

## 新增实体或改表

1. 改 **`*.entity.ts`**。  
2. 生成迁移：`npm run migration:generate -- src/migrations/<时间戳>-<名称>`，或手写 `MigrationInterface`。  
3. 在 **`src/data-source.ts`** 的 **`migrations`** 数组中 **import 并追加** 新类。  
4. 本地连 dev 库 **`migration:run`** 自测后提交 PR。
