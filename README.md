codex resume 019d8ab1-3de9-7c72-8ac5-4607fe06f73bbac
# Customer Bot

面向试运营 SaaS 场景的可嵌入网站 AI 客服挂件与管理后台。

## Current Scope

当前版本包含：

- 租户级运行时配置 API
- 服务端聊天接口
- Token 用量记录骨架
- 租户管理后台页面
- 客户嵌入式 `customer-bot.js`
- 截图附件随会话持久化
- 产品参数表与回答引用来源

## Local Run

```bash
npm install
npm test
npm run dev
npm run build
```

本地演示入口：

- 前台演示页：`/`
- 后台登录页：`/admin/login`

当前可演示能力：

- 租户模式多轮聊天
- 聊天记录与 Token 用量持久化
- 截图附件上传并在后台聊天记录中查看
- 价格问答返回产品参数表
- 文档/价格回答附带参考资料
- 租户详情页支持维护知识条目/文档/产品/咨询服务 JSON
- 租户详情页支持维护网页、邮件、文档、表格资料源
- 资料源支持启停、分类筛选与命中统计
- 聊天后台支持只看命中过资料的会话
- 租户详情页支持会话数、留资数、最近账单和高频资料总览
- 资料源命中统计支持跳转查看相关聊天
- 新增租户自动生成租户登录账号
- 租户可通过 `/tenant/login` 自助查看本租户训练记录与账单摘要
- 租户可通过 `/tenant/chats` 只读查看本租户聊天记录、附件与命中资料
- 租户可通过 `/tenant/leads` 只读查看本租户留资线索
- 租户支持初始密码登录、首次改密、邮箱重置码改密

默认演示租户：

```text
tenant-demo
```

你也可以访问 `/?tenantId=你的租户ID` 切换首页挂件演示租户。

默认后台账号：

```text
admin@example.com / admin123456
```

可通过环境变量覆盖：

```bash
CUSTOMER_BOT_ADMIN_EMAIL=admin@example.com
CUSTOMER_BOT_ADMIN_PASSWORD=admin123456
CUSTOMER_BOT_DATA_FILE=/absolute/path/customer-bot-storage.json
CUSTOMER_BOT_PUBLIC_BASE_URL=https://bot.aifactory.website
CUSTOMER_BOT_STAGING_BASE_URL=https://bot.aifactory.website
CUSTOMER_BOT_MAIL_PROVIDER=resend
CUSTOMER_BOT_MAIL_FROM=no-reply@your-domain.example
CUSTOMER_BOT_RESEND_API_KEY=re_xxx
```

默认情况下，聊天记录、留资、账单明细会落盘到 `.data/customer-bot-storage.json`。

构建产物：

- 挂件脚本：`dist/customer-bot.js`
- Nuxt 服务端：`.output/`

本地预览生产包：

```bash
npm run build
npm run preview
```

租户详情页的安装面板支持：

- 测试环境 / 正式环境切换
- 一键复制 `tenantId`
- 一键复制 `embedKey`
- 一键复制脚本地址、API 地址和完整安装代码

## Customer Install

客户站点引入构建后的脚本：

```html
<script src="https://bot.aifactory.website/customer-bot.js"></script>
<script>
  CustomerBot.init({
    tenantId: 'tenant-demo',
    apiBaseUrl: 'https://bot.aifactory.website'
  })
</script>
```

更完整的客户安装说明见 [customer-install.md](/Users/matiko/Documents/Webstrom/aifactory_website/customer_bot/customer-install.md)。
租户只读交付说明见 [tenant-readonly-delivery.md](/Users/matiko/Documents/Webstrom/aifactory_website/customer_bot/tenant-readonly-delivery.md)。
系统发布说明见 [system-release.md](/Users/matiko/Documents/Webstrom/aifactory_website/customer_bot/system-release.md)。

## API

```js
CustomerBot.init(options)
CustomerBot.open()
CustomerBot.close()
CustomerBot.destroy()
```

## Options

- `tenantId`: SaaS 租户 ID，启用服务端租户配置与聊天接口
- `apiBaseUrl`: SaaS 服务端地址，用于跨站调用 `/api/embed/config`、`/api/chat`、`/api/contact`
- `siteName`: 挂件顶部显示的站点名称
- `themeColor`: 主色
- `submitEndpoint`: 联系表单提交地址
- `mode`: `inline` 或 `iframe`
- `iframeSrc`: iframe 模式下的挂件页面地址
- `llmEndpoint`: 大模型接口地址
- `apiKey`: 大模型接口密钥
- `model`: 大模型名称
- `systemPrompt`: 自定义系统提示词
- `soulProfile`: 客服人格配置
- `contact`: 联系信息
- `knowledge`: 文档问答知识条目
- `articles`: 文档数据
- `products`: 产品数据
- `consultingServices`: 咨询服务数据
- `contentSources`: 资料源数组，支持 `webpage` / `email` / `document` / `excel`

## Iframe Mode

```html
<script src="/customer-bot.js"></script>
<script>
  CustomerBot.init({
    mode: 'iframe',
    iframeSrc: '/customer-bot-frame.html'
  })
</script>
```
