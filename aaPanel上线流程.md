# aaPanel 上线流程

适用场景：

- 域名：`bot.factory.website`
- 部署方式：单域名 + 路径前缀
- 服务器：Linux
- 面板：aaPanel
- 进程管理：`pm2`
- 文件存储：本地磁盘
- 当前项目结构：前端主应用 + 4 个服务

相关参考文件：

- 部署细节说明：[docs/deployment-bot.factory.website-aapanel.md](D:/ai/aifactory_website/customer_bot/docs/deployment-bot.factory.website-aapanel.md)
- PM2 配置：[deploy/pm2/ecosystem.config.cjs](D:/ai/aifactory_website/customer_bot/deploy/pm2/ecosystem.config.cjs)
- 主应用环境模板：[.env.production.example](D:/ai/aifactory_website/customer_bot/.env.production.example)
- 服务环境模板：
  - [services/tenant-identity-service/.env.example](D:/ai/aifactory_website/customer_bot/services/tenant-identity-service/.env.example)
  - [services/knowledge-indexing-service/.env.example](D:/ai/aifactory_website/customer_bot/services/knowledge-indexing-service/.env.example)
  - [services/agent-runtime-service/.env.example](D:/ai/aifactory_website/customer_bot/services/agent-runtime-service/.env.example)
  - [services/embed-delivery-service/.env.example](D:/ai/aifactory_website/customer_bot/services/embed-delivery-service/.env.example)

## 1. 服务拓扑

线上访问路径：

- `https://bot.factory.website/` -> 前端主应用
- `https://bot.factory.website/identity/` -> `tenant-identity-service`
- `https://bot.factory.website/indexing/` -> `knowledge-indexing-service`
- `https://bot.factory.website/runtime/` -> `agent-runtime-service`
- `https://bot.factory.website/embed/` -> `embed-delivery-service`

服务端口：

- 主应用：`3203`
- `tenant-identity-service`：`3301`
- `knowledge-indexing-service`：`3302`
- `agent-runtime-service`：`3303`
- `embed-delivery-service`：`3304`

## 2. 服务器准备

确认服务器已安装：

- `Node.js 22+`
- `npm`
- `pm2`
- `MySQL`
- `PostgreSQL`
- `pgvector`

推荐目录结构：

```text
/www/wwwroot/bot.factory.website/
  ├─ app/
  ├─ services/
  └─ shared/
      ├─ .data/
      ├─ env/
      └─ logs/
```

推荐共享目录：

```text
/www/wwwroot/bot.factory.website/shared
```

## 3. 上传代码并安装依赖

把仓库代码上传到站点目录，例如：

```bash
cd /www/wwwroot/bot.factory.website/app
npm install
```

如果你把代码放在别的目录，后面要同步修改：

- `deploy/pm2/ecosystem.config.cjs`
- aaPanel 反向代理目标
- 共享目录路径

## 4. 数据库准备

### MySQL

用于租户身份、登录等相关数据。

### PostgreSQL + pgvector

用于知识库索引和向量检索。

如果还没有启用 `pgvector`，先执行：

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

如果你准备让知识索引落 PostgreSQL，需要确保：

- `CUSTOMER_BOT_DATABASE_URL` 可用
- 运行过数据库迁移

执行迁移：

```bash
cd /www/wwwroot/bot.factory.website/app
npm run db:migrate
```

## 5. 环境变量准备

你至少需要准备这些真实值：

- MySQL 连接信息
- PostgreSQL 连接信息
- LLM 接口地址
- LLM API Key
- 平台共享 fallback 模型地址与 Key
- 邮件发送配置

主应用关键环境变量应指向线上路径前缀：

```bash
TENANT_IDENTITY_SERVICE_URL=https://bot.factory.website/identity
KNOWLEDGE_INDEXING_SERVICE_URL=https://bot.factory.website/indexing
AGENT_RUNTIME_SERVICE_URL=https://bot.factory.website/runtime
EMBED_DELIVERY_SERVICE_URL=https://bot.factory.website/embed
```

如果你用 `deploy/pm2/ecosystem.config.cjs`，需要把里面的占位值改成真实值，重点是：

- `CUSTOMER_BOT_SHARED_DIR`
- `CUSTOMER_BOT_DATABASE_URL`
- `CUSTOMER_BOT_LLM_ENDPOINT`
- `CUSTOMER_BOT_LLM_API_KEY`
- `CUSTOMER_BOT_LLM_MODEL`
- `CUSTOMER_BOT_PLATFORM_LLM_ENDPOINT`
- `CUSTOMER_BOT_PLATFORM_LLM_API_KEY`
- `CUSTOMER_BOT_PLATFORM_LLM_MODEL`

## 6. 构建主应用

在项目根目录执行：

```bash
cd /www/wwwroot/bot.factory.website/app
npm run build
```

说明：

- 当前上线构建入口应该使用 `build`
- `build` 会同时生成 Nuxt 服务端产物和 `dist/customer-bot.js`
- `app:build` 只构建 Nuxt 主应用，不适合当前多服务正式发布链路
- `app:bundle` 会在 `build` 基础上额外归档发布产物

## 7. PM2 启动

首次启动：

```bash
cd /www/wwwroot/bot.factory.website/app
npm run deploy:pm2:start
pm2 save
pm2 status
```

更新代码或环境变量后重载：

```bash
cd /www/wwwroot/bot.factory.website/app
npm run deploy:pm2:reload
```

查看日志：

```bash
cd /www/wwwroot/bot.factory.website/app
npm run deploy:pm2:logs
```

你应该能看到 5 个进程：

- `customer-bot-app`
- `tenant-identity-service`
- `knowledge-indexing-service`
- `agent-runtime-service`
- `embed-delivery-service`

## 8. aaPanel 站点与反向代理

在 aaPanel 中：

1. 新建站点：`bot.factory.website`
2. 绑定现有 HTTPS 证书
3. 添加反向代理

推荐规则：

```nginx
location /identity/ {
    proxy_pass http://127.0.0.1:3301/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /indexing/ {
    proxy_pass http://127.0.0.1:3302/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /runtime/ {
    proxy_pass http://127.0.0.1:3303/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /embed/ {
    proxy_pass http://127.0.0.1:3304/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location / {
    proxy_pass http://127.0.0.1:3203/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## 9. 上线后检查

先检查服务健康：

- `https://bot.factory.website/identity/health`
- `https://bot.factory.website/indexing/health`
- `https://bot.factory.website/runtime/health`
- `https://bot.factory.website/embed/health`

再检查页面：

- `https://bot.factory.website/`
- `https://bot.factory.website/admin/login`

后台登录默认账号仍是：

```text
admin@example.com
admin123456
```

## 10. 租户上线前最后检查

上线后建议在后台确认：

- 租户是否创建成功
- `RAG` 设置是否正确
- 资料源是否已同步
- 索引统计是否有文档数和 chunk 数
- Agent 文档是否已生成
- 聊天是否能返回 `structured / rag / general_fallback`

## 11. 常用命令清单

主应用开发：

```bash
npm run app:dev
```

主应用构建：

```bash
npm run build
```

本地整栈：

```bash
npm run stack:dev
```

类型检查：

```bash
npm run verify:types
```

启动验证：

```bash
npm run verify:stack-launcher
```

## 12. 出问题时优先看哪里

先看 `pm2` 日志：

- 主应用日志
- `knowledge-indexing-service` 日志
- `agent-runtime-service` 日志

其次检查：

- aaPanel 反向代理目标端口是否填对
- `ecosystem.config.cjs` 中数据库和模型地址是否还是占位值
- PostgreSQL 是否真的启用了 `pgvector`
- 主应用的 4 个 `*_SERVICE_URL` 是否指向 `https://bot.factory.website/<prefix>`
