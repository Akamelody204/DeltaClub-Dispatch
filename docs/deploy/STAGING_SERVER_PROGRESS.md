# Staging 服务器配置进度记录

| 属性 | 内容 |
|------|------|
| **版本** | v0.1 |
| **日期** | 2026-04-06 |
| **范围** | 腾讯云 staging 服务器初始化、后端部署准备、数据库迁移落地 |

---

## 0. 当前结论

- **服务器基础环境已基本就绪**：SSH、Node.js、npm、MySQL、Nginx、pm2 已完成安装或验证。  
- **仓库已拉到服务器**：`~/DeltaClub-Dispatch`。  
- **数据库迁移已执行成功**：`users`、`orders`、`typeorm_migrations` 已按 baseline migration 建表。  
- **当前阻塞点**：Nest 启动时 `OrdersModule` 无法解析 `JwtAuthGuard` 所需的 `JwtService`；本地仓库已修复，待同步到 GitHub 并让服务器重新拉取。  

---

## 1. 已完成进度

### 1.1 云资源与系统

- 已购买腾讯云轻量应用服务器。  
- 地域：**上海**。  
- 系统：**Ubuntu 22.04 LTS**。  
- 已开放端口：**22 / 80 / 443**。  

### 1.2 远程登录

- 已生成并使用本地 SSH 私钥。  
- 本地私钥路径：`C:\Users\Administrator\.ssh\clubxcx_staging_ed25519`。  
- 已可通过 SSH 登录服务器。  

### 1.3 服务器基础环境

- 已完成系统更新。  
- 已安装基础工具：`git`、`curl`、`unzip`、`nginx`。  
- 已安装 Node.js 与 npm。  
- 已安装并启动 MySQL。  
- 已安装 pm2。  

### 1.4 仓库与数据库

- 已将仓库克隆到服务器：`~/DeltaClub-Dispatch`。  
- 已创建数据库：`clubxcx_staging`。  
- 已创建数据库用户：`clubxcx@127.0.0.1`。  
- 已复制并编辑服务器端 `server/.env`。  
- 当前 `.env` 策略：`DB_SYNC=false`、`WECHAT_USE_MOCK=true`。  

### 1.5 B1-6 迁移

- 本地仓库已落地 **B1-6 数据库迁移与 Schema 演进**。  
- 已新增：
  - `server/src/data-source.ts`
  - `server/src/database/typeorm-app-options.ts`
  - `server/src/migrations/1744000000000-BaselineSchema.ts`
  - `server/docs/MIGRATIONS.md`
- 服务器已执行：
  - `npm run build`
  - `npm run migration:run:dist`
- baseline migration 执行成功。  

---

## 2. 遇到的问题与处理

### 2.1 SSH 与终端交互不稳定

**现象**

- SSH 连接成功后，终端偶发显示异常或交互卡住。  
- `apt upgrade` 过程中出现紫色交互框，不易在当前终端中正常确认。  

**处理**

- 改用更稳定的本地 PowerShell + SSH 操作。  
- 遇到 `apt` 卡住时，停止重复进程，执行：
  - `sudo dpkg --configure -a`
  - `sudo apt -f install`
- 后续安装尽量采用非交互方式。  

### 2.2 GitHub private 仓库克隆失败

**现象**

- 服务器执行 `git clone https://github.com/...` 时提示认证失败。  
- GitHub 不支持账号密码直接拉取 private 仓库。  

**处理**

- 将仓库调整为 **public** 后重新 `git clone`，问题解决。  

### 2.3 MySQL 授权语句报错

**现象**

- `GRANT ALL PRIVILEGES ... TO ...` 一度报 `ERROR 1064 (42000)`。  

**原因**

- 输入过程混入异常字符，导致 `TO` 或引号未被 MySQL 识别为标准 SQL 字符。  

**处理**

- 在 MySQL 终端中重新手敲授权语句。  
- 通过 `SHOW GRANTS FOR 'clubxcx'@'127.0.0.1';` 确认授权已生效。  

### 2.4 Nest 应用启动失败

**现象**

- 执行 `NODE_ENV=staging node dist/main.js` 后报错：  
  `Nest can't resolve dependencies of the JwtAuthGuard (?) ... argument JwtService at index [0] is not available in the OrdersModule context.`

**原因**

- `OrdersModule` 中使用了 `JwtAuthGuard`，但模块未导入 `AuthModule`，导致 `JwtService` 无法注入。  

**处理**

- 本地代码已修复：在 `server/src/order/orders.module.ts` 中为 `imports` 增加 `AuthModule`。  
- 本地 `npm run build` 已验证通过。  
- 当前待办：将该修复成功推送到 GitHub，并在服务器端 `git pull` 后重新构建启动。  

---

## 3. 当前阻塞点

- **代码同步阻塞**：`OrdersModule` 的修复尚未稳定同步到服务器当前副本。  
- **应用尚未成功启动**：因此 `/health` 还未完成服务器本机验证。  
- **域名 / HTTPS 尚未进入正式配置阶段**：当前仍处于后端服务可启动验证阶段。  

---

## 4. 下一步操作

1. 将本地修复后的 `orders.module.ts` 成功推送到 GitHub。  
2. 服务器执行：

   ```bash
   cd ~/DeltaClub-Dispatch
   git pull
   cd server
   npm run build
   NODE_ENV=staging node dist/main.js
   ```

3. 另开终端验证：

   ```bash
   curl -s http://127.0.0.1:3000/health
   ```

4. 若本机验证通过，再进入：
   - pm2 常驻
   - Nginx 反代
   - HTTPS 证书
   - 微信 request 合法域名

---

## 5. 关联文档

- [B1-5-staging部署与合法域名.md](file:///d:/我的文档/clubxcx/plan/backend/dev/B1-5-staging部署与合法域名.md)
- [B1-6-数据库迁移与Schema演进.md](file:///d:/我的文档/clubxcx/plan/backend/dev/B1-6-数据库迁移与Schema演进.md)
- [DEPLOY-STAGING.md](file:///d:/我的文档/clubxcx/server/docs/DEPLOY-STAGING.md)
- [MIGRATIONS.md](file:///d:/我的文档/clubxcx/server/docs/MIGRATIONS.md)
