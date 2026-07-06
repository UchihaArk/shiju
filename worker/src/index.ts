import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { getDb } from "./db";
import { users } from "./schema";
import { members } from "./routes/members";
import { eventsRouter } from "./routes/events";
import { tasksRouter } from "./routes/tasks";
import { subsRouter } from "./routes/subscriptions";
import { reportRouter } from "./routes/report";
import { holidaysRouter } from "./routes/holidays";
import { runCron } from "./cron";
import type { AppEnv } from "./types";

const app = new Hono<{ Bindings: AppEnv }>();
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: (origin) => origin,
    allowHeaders: ["Content-Type", "x-user-id"],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  }),
);

app.get("/api/health", async (c) => {
  const db = getDb(c.env.DB);
  const all = await db.select().from(users);
  return c.json({ ok: true, users: all.length });
});

// 公开：VAPID 公钥（客户端订阅前拉取）
app.get("/api/vapid-public", (c) => c.json({ key: c.env.VAPID_PUBLIC_KEY }));

app.route("/api/members", members);
app.route("/api/events", eventsRouter);
app.route("/api/tasks", tasksRouter);
app.route("/api/subscriptions", subsRouter);
app.route("/api/report", reportRouter);
app.route("/api/holidays", holidaysRouter);

export default {
  fetch: app.fetch,
  async scheduled(_controller: ScheduledController, env: AppEnv, _ctx: ExecutionContext) {
    try {
      await runCron(env);
    } catch (err) {
      console.error("[cron] error", err);
    }
  },
} satisfies ExportedHandler<AppEnv>;
