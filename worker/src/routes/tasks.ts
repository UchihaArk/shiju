import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { events, tasks } from "../schema";
import { toTask } from "../serialize";
import { requireMember } from "../auth";
import type { AppEnv, MemberDTO } from "../types";

export const tasksRouter = new Hono<{
  Bindings: AppEnv;
  Variables: { member: MemberDTO };
}>();
tasksRouter.use("*", requireMember);

/** 列出全部子任务。 */
tasksRouter.get("/", async (c) => {
  const db = getDb(c.env.DB);
  const rows = await db.select().from(tasks).all();
  return c.json(rows.map(toTask));
});

/** 认领。 */
tasksRouter.post("/:id/claim", async (c) => {
  const member = c.get("member");
  const id = c.req.param("id");
  const db = getDb(c.env.DB);
  await db
    .update(tasks)
    .set({ status: "claimed", assigneeId: member.id, claimedAt: new Date().toISOString() })
    .where(eq(tasks.id, id));
  const row = await db.select().from(tasks).where(eq(tasks.id, id)).get();
  if (!row) return c.json({ error: "not found" }, 404);
  return c.json(toTask(row));
});

/** 完成。 */
tasksRouter.post("/:id/complete", async (c) => {
  const id = c.req.param("id");
  const db = getDb(c.env.DB);
  await db
    .update(tasks)
    .set({ status: "done", doneAt: new Date().toISOString() })
    .where(eq(tasks.id, id));
  const row = await db.select().from(tasks).where(eq(tasks.id, id)).get();
  if (!row) return c.json({ error: "not found" }, 404);
  return c.json(toTask(row));
});

/** 编辑子任务标题（仅事项创建者）。 */
tasksRouter.patch("/:id", async (c) => {
  const member = c.get("member");
  const id = c.req.param("id");
  const db = getDb(c.env.DB);
  const task = await db.select().from(tasks).where(eq(tasks.id, id)).get();
  if (!task) return c.json({ error: "not found" }, 404);
  const event = await db.select().from(events).where(eq(events.id, task.eventId)).get();
  if (!event || event.createdBy !== member.id) return c.json({ error: "forbidden" }, 403);
  const body = await c.req.json<{ title: string }>();
  if (!body.title?.trim()) return c.json({ error: "title required" }, 400);
  await db.update(tasks).set({ title: body.title.trim() }).where(eq(tasks.id, id));
  const row = await db.select().from(tasks).where(eq(tasks.id, id)).get();
  return c.json(toTask(row!));
});

/** 删除子任务（仅事项创建者）。 */
tasksRouter.delete("/:id", async (c) => {
  const member = c.get("member");
  const id = c.req.param("id");
  const db = getDb(c.env.DB);
  const task = await db.select().from(tasks).where(eq(tasks.id, id)).get();
  if (!task) return c.json({ error: "not found" }, 404);
  const event = await db.select().from(events).where(eq(events.id, task.eventId)).get();
  if (!event || event.createdBy !== member.id) return c.json({ error: "forbidden" }, 403);
  await db.delete(tasks).where(eq(tasks.id, id));
  return c.json({ ok: true });
});
