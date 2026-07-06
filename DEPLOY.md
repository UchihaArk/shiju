# 拾聚 部署指南（Phase 2 全栈）

两件套：
- `worker/` — Hono on Cloudflare Workers（D1 + Web Push + Cron）
- 根目录 — Next.js 前端（经 API 调 Worker）

## 本地开发（两个终端）

**终端 1 — Worker + 本地 D1**
```bash
cd worker
npm install
npm run db:apply:local     # 建表（首次）
npm run db:seed:local      # 灌种子：5 成员 / 10 事项 / 14 任务（首次，可选）
npm run dev                # http://localhost:8787
```
VAPID 密钥已生成在 `worker/.dev.vars`（本地专用，已 gitignore）。重新生成：
`npx web-push generate-vapid-keys`。

**终端 2 — 前端**
```bash
npm install                # 根目录
npm run dev                # http://localhost:3000，读 .env.local 的 NEXT_PUBLIC_API_URL
```

## 生产部署（在你的 Cloudflare 账户执行）

> Claude 无法访问你的 Cloudflare 账户，以下命令需你在本机运行。

### 1. Worker

```bash
cd worker
npx wrangler login

# 远端建表 + 灌种子（D1 库 shiju 已建，id 已写进 wrangler.jsonc）
npm run db:apply:remote
npm run db:seed:remote

# 生成「生产」VAPID 密钥（不要用本地那对），记下 Public/Private
npx web-push generate-vapid-keys

# 写入密钥（粘贴上一步的值）
npx wrangler secret put VAPID_PUBLIC_KEY
npx wrangler secret put VAPID_PRIVATE_KEY
npx wrangler secret put VAPID_SUBJECT      # 输入 mailto:你的邮箱@example.com

# 部署
npm run deploy
```
部署后地址形如 `https://shiju-api.<你的子域>.workers.dev`。

### 2. 前端

设环境变量（部署平台 vars 或 `.env.production`）：
- `NEXT_PUBLIC_API_URL` = 上一步的 Worker 地址
- （前端 VAPID 公钥由 Worker `/api/vapid-public` 提供，无需单配）

用 OpenNext 部署到 Cloudflare Workers（Next 16 已支持）：
```bash
npm i @opennextjs/cloudflare
npx opennextjs-cloudflare build
npx opennextjs-cloudflare deploy
```
> 也可部署到 Vercel / 任意 Node 主机。注意 `/events/[id]` 是动态路由，需 SSR 支持（纯静态导出不适用）。

## 数据维护（重跑安全）

`seed.sql` 已幂等（`INSERT OR IGNORE` + 末尾 `UPDATE`），随时可重跑，会刷新成员**名字/生日**，不会报错、不会重复事件：
```bash
cd worker
npm run db:seed:remote        # 远端；本地用 db:seed:local
```

清空测试事件/任务（保留 5 位成员 + 节假日），开始真实使用：
```bash
npx wrangler d1 execute shiju --remote --command "DELETE FROM tasks; DELETE FROM subscriptions; DELETE FROM events;"
```

节假日：Cron 每晚会自动同步「缺失的年份」。部署后想立即填充（不等当晚 Cron），curl 一次：
```bash
curl -X POST -H "x-user-id: u_ma" "https://<worker地址>/api/holidays/sync?year=2026"
```

## 备注

- **D1 库 id** 已配在 `worker/wrangler.jsonc`（`de0e0957-1a06-49e4-b2f3-dc3570fc3f4c`）。
- **免密身份**：前端把座位牌 userId 放 `x-user-id` 头，Worker 查 D1 校验。
- **Cron**：北京 20:00（UTC 12:00）扫「明天」的事项/生日并推送。本地手动触发：
  `curl http://localhost:8787/cdn-cgi/handler/scheduled`
- **重置本地库**：
  ```bash
  cd worker
  npx wrangler d1 execute shiju --local --command "DELETE FROM tasks; DELETE FROM subscriptions; DELETE FROM events; DELETE FROM users;"
  npm run db:seed:local
  ```
