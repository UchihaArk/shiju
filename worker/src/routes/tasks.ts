import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { tasks } from "../schema";
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
