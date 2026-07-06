import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { subscriptions } from "../schema";
import { requireMember } from "../auth";
import { initPush, sendPush } from "../push";
import type { AppEnv, MemberDTO } from "../types";

export const subsRouter = new Hono<{
  Bindings: AppEnv;
  Variables: { member: MemberDTO };
}>();
subsRouter.use("*", requireMember);

/** 注册推送订阅（同一 endpoint 去重）。 */
subsRouter.post("/", async (c) => {
  const member = c.get("member");
  const body = await c.req.json<{
    endpoint: string;
    keys: { p256dh: string; auth: string };
  }>();
  if (!body?.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
    return c.json({ error: "bad subscription" }, 400);
  }
  const db = getDb(c.env.DB);
  const existing = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.endpoint, body.endpoint))
    .get();
  if (!existing) {
    const id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await db.insert(subscriptions).values({
      id,
      userId: member.id,
      endpoint: body.endpoint,
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
      createdAt: new Date().toISOString(),
    });
  }
  return c.json({ ok: true }, 201);
});

/** 取消订阅。 */
subsRouter.delete("/", async (c) => {
  const body = await c.req.json<{ endpoint: string }>();
  if (!body?.endpoint) return c.json({ error: "endpoint required" }, 400);
  const db = getDb(c.env.DB);
  await db.delete(subscriptions).where(eq(subscriptions.endpoint, body.endpoint));
  return c.json({ ok: true });
});

/** 测试推送：向当前成员的所有订阅发一条。 */
subsRouter.post("/test", async (c) => {
  const member = c.get("member");
  initPush(c.env);
  const db = getDb(c.env.DB);
  const subs = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, member.id))
    .all();
  let sent = 0;
  for (const s of subs) {
    const ok = await sendPush(
      { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
      { title: "拾聚 · 测试通知", body: "看到这条说明家庭提醒已通✅", data: { url: "/" } },
    );
    if (ok) sent++;
  }
  return c.json({ ok: true, sent, total: subs.length });
});
