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
- **后端服务已启动并通过健康检查**：`curl http://127.0.0.1:3000/health` 返回 `code=0`、`status=ok`。  
- **pm2 已接管并完成开机自启**：当前服务名为 `clubxcx-api-staging`。  
- **Nginx 反向代理已完成并通过公网验证**：公网 IP 访问 `/health` 已成功返回健康检查 JSON。  
- **staging 域名与 HTTPS 已完成**：`https://api-staging.akamelody.online/health` 返回 `200 OK` 与健康检查 JSON。  
- **当前下一步**：进入微信公众平台配置 `request` 合法域名，并让小程序切换到 staging 基础地址。  

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

### 1.6 应用启动与托管

- 已从 GitHub 拉取包含 `OrdersModule` 修复的新版本代码。  
- 已重新执行 `npm run build`。  
- 已验证 `NODE_ENV=staging node dist/main.js` 可正常启动。  
- 已通过本机健康检查：
  - `curl -s http://127.0.0.1:3000/health`
- 已使用 pm2 托管：
  - 进程名：`clubxcx-api-staging`
  - 状态：`online`
- 已完成 pm2 开机自启：
  - `pm2 save`
  - `pm2 startup`
  - systemd 已创建 `pm2-ubuntu.service`

### 1.7 Nginx 反向代理与公网验证

- 已修改 `/etc/nginx/sites-available/default`，将 `location /` 代理到 `http://127.0.0.1:3000`。  
- 已执行：
  - `sudo nginx -t`
  - `sudo systemctl reload nginx`
  - `sudo systemctl status nginx --no-pager`
- 已确认 Nginx 状态为 `active (running)`。  
- 已验证本机通过 Nginx 访问：
  - `curl -s http://127.0.0.1/health`
- 已验证公网通过服务器 IP 访问：
  - `http://124.220.101.133/health`

### 1.8 域名与 HTTPS 准备

- 已确定 staging 域名为：`api-staging.akamelody.online`。  
- 已在 DNS 中添加 A 记录，将该子域名指向服务器公网 IP：`124.220.101.133`。  
- 已确认 DNS 解析生效，`api-staging.akamelody.online` 可解析到 `124.220.101.133`。  
- 已将 Nginx `server_name` 从 `_` 改为 `api-staging.akamelody.online`。  
- 已安装：
  - `certbot`
  - `python3-certbot-nginx`
- 已使用 Certbot / Let’s Encrypt 为 `api-staging.akamelody.online` 签发并部署 HTTPS 证书。  
- 已验证：
  - `curl -I https://api-staging.akamelody.online/health`
  - `curl -s https://api-staging.akamelody.online/health`
- 当前域名 HTTPS 访问已打通。  

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
- 后续处理结果：修复已推送到 GitHub，服务器 `git pull`、`npm run build` 后启动成功。  

### 2.5 pm2 日志命令看似“卡住”

**现象**

- 执行 `pm2 logs clubxcx-api-staging --lines 50` 后终端一直停在 `[TAILING]`。  

**原因**

- `pm2 logs` 是持续追踪日志命令，不会像普通命令一样自动退出。  

**处理**

- 使用 `Ctrl + C` 退出日志跟随模式。  
- 后续将其视为“查看实时日志”的命令，而非一次性检查命令。  

### 2.6 Nginx 变量名拼写错误

**现象**

- 执行 `sudo nginx -t` 时提示：  
  `unknown "proxy_add_x_forward_for" variable`

**原因**

- `X-Forwarded-For` 对应的 Nginx 变量名拼写错误，误写为：
  - `$proxy_add_x_forward_for`
- 正确写法应为：
  - `$proxy_add_x_forwarded_for`

**处理**

- 修正变量名后重新执行：
  - `sudo nginx -t`
  - `sudo systemctl reload nginx`
- 修复后 Nginx 校验与反代均通过。  

### 2.7 Certbot / HTTPS 配置

**现象**

- 在域名解析生效后，需要为 staging 域名启用 HTTPS。  

**处理**

- 将 Nginx `server_name` 切换为：
  - `api-staging.akamelody.online`
- 安装：
  - `certbot`
  - `python3-certbot-nginx`
- 执行：
  - `sudo certbot --nginx -d api-staging.akamelody.online`
- 结果：
  - 证书签发成功
  - Nginx 自动接入证书成功
  - `https://api-staging.akamelody.online/health` 返回 `200 OK`

---

## 3. 当前状态

- **后端应用已可本机访问**：`127.0.0.1:3000/health` 可返回健康检查 JSON。  
- **pm2 托管与开机自启已完成**。  
- **Nginx 反代与公网 IP 访问已完成**。  
- **域名解析与 HTTPS 已完成**：`api-staging.akamelody.online` 已可正常访问 `/health`。  
- **待完成项已收敛到小程序接入**：下一步是微信合法域名配置与小程序切换 staging 地址。  

---

## 4. 下一步操作

1. 在微信公众平台配置 `request` 合法域名为：

   ```text
   https://api-staging.akamelody.online
   ```

2. 在小程序 staging 环境中，将后端基础地址切换为：

   ```text
   https://api-staging.akamelody.online
   ```

3. 进行真机联调，优先验证：
   - 健康检查
   - 微信登录链路
   - 下单 / 我的订单等最小闭环

4. 完成联调后，再视需要补充：
   - Certbot 自动续期 dry-run 验证
   - Nginx 更细的安全头与日志策略

---

## 5. 关联文档

- [B1-5-staging部署与合法域名.md](file:///d:/我的文档/clubxcx/plan/backend/dev/B1-5-staging部署与合法域名.md)
- [B1-6-数据库迁移与Schema演进.md](file:///d:/我的文档/clubxcx/plan/backend/dev/B1-6-数据库迁移与Schema演进.md)
- [DEPLOY-STAGING.md](file:///d:/我的文档/clubxcx/server/docs/DEPLOY-STAGING.md)
- [MIGRATIONS.md](file:///d:/我的文档/clubxcx/server/docs/MIGRATIONS.md)
