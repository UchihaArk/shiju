import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { events, tasks } from "../schema";
import { toEvent, toTask } from "../serialize";
import { requireMember } from "../auth";
import type { AppEnv, MemberDTO } from "../types";

export const eventsRouter = new Hono<{
  Bindings: AppEnv;
  Variables: { member: MemberDTO };
}>();
eventsRouter.use("*", requireMember);

/** 列出全部事项（含 taskIds）。 */
eventsRouter.get("/", async (c) => {
  const db = getDb(c.env.DB);
  const [eventRows, taskRows] = await Promise.all([
    db.select().from(events).all(),
    db.select().from(tasks).all(),
  ]);
  const idsByEvent = new Map<string, string[]>();
  for (const t of taskRows) {
    const arr = idsByEvent.get(t.eventId) ?? [];
    arr.push(t.id);
    idsByEvent.set(t.eventId, arr);
  }
  return c.json(eventRows.map((e) => toEvent(e, idsByEvent.get(e.id) ?? [])));
});

/** 新建事项（含子任务一并建，状态 unclaimed）。 */
eventsRouter.post("/", async (c) => {
  const member = c.get("member");
  const body = await c.req.json<{
    title: string;
    note?: string;
    date: string;
    recurrence: "once" | "monthly" | "yearly";
    color: string;
    subjectId?: string | null;
    subtasks?: string[];
  }>();

  if (!body.title?.trim()) return c.json({ error: "title required" }, 400);

  const db = getDb(c.env.DB);
  const eventId = `e_${Date.now()}`;
  const now = Date.now();
  const subtaskRows = (body.subtasks ?? [])
    .map((s) => s.trim())
    .filter(Boolean)
    .map((title, i) => ({
      id: `t_${now}_${i}`,
      eventId,
      title,
      assigneeId: null,
      status: "unclaimed" as const,
      claimedAt: null,
      doneAt: null,
    }));

  await db.batch([
    db.insert(events).values({
      id: eventId,
      title: body.title.trim(),
      note: body.note?.trim() || null,
      date: body.date,
      recurrence: body.recurrence,
      createdBy: member.id,
      color: body.color,
      subjectId: body.subjectId || null,
    }),
    ...subtaskRows.map((t) => db.insert(tasks).values(t)),
  ]);

  return c.json(
    {
      event: toEvent(
        {
          id: eventId,
          title: body.title.trim(),
          note: body.note?.trim() || null,
          date: body.date,
          recurrence: body.recurrence,
          createdBy: member.id,
          color: body.color,
          subjectId: body.subjectId || null,
        },
        subtaskRows.map((t) => t.id),
      ),
      tasks: subtaskRows.map(toTask),
    },
    201,
  );
});

/** 编辑事项（仅创建者）。 */
eventsRouter.put("/:id", async (c) => {
  const member = c.get("member");
  const id = c.req.param("id");
  const db = getDb(c.env.DB);
  const existing = await db.select().from(events).where(eq(events.id, id)).get();
  if (!existing) return c.json({ error: "not found" }, 404);
  if (existing.createdBy !== member.id) return c.json({ error: "forbidden" }, 403);

  const body = await c.req.json<{
    title?: string;
    note?: string | null;
    date?: string;
    recurrence?: "once" | "monthly" | "yearly";
    color?: string;
    subjectId?: string | null;
  }>();

  await db
    .update(events)
    .set({
      title: (body.title ?? existing.title).trim(),
      note: body.note !== undefined ? body.note?.trim() || null : existing.note,
      date: body.date ?? existing.date,
      recurrence: body.recurrence ?? existing.recurrence,
      color: body.color ?? existing.color,
      subjectId: body.subjectId !== undefined ? body.subjectId || null : existing.subjectId,
    })
    .where(eq(events.id, id));

  const updated = await db.select().from(events).where(eq(events.id, id)).get();
  const taskRows = await db.select().from(tasks).where(eq(tasks.eventId, id)).all();
  return c.json(toEvent(updated!, taskRows.map((t) => t.id)));
});

/** 删除事项（仅创建者，连带删除子任务）。 */
eventsRouter.delete("/:id", async (c) => {
  const member = c.get("member");
  const id = c.req.param("id");
  const db = getDb(c.env.DB);
  const existing = await db.select().from(events).where(eq(events.id, id)).get();
  if (!existing) return c.json({ error: "not found" }, 404);
  if (existing.createdBy !== member.id) return c.json({ error: "forbidden" }, 403);
  await db.delete(tasks).where(eq(tasks.eventId, id));
  await db.delete(events).where(eq(events.id, id));
  return c.json({ ok: true });
});

/** 新增子任务（仅事项创建者）。 */
eventsRouter.post("/:id/tasks", async (c) => {
  const member = c.get("member");
  const id = c.req.param("id");
  const db = getDb(c.env.DB);
  const existing = await db.select().from(events).where(eq(events.id, id)).get();
  if (!existing) return c.json({ error: "not found" }, 404);
  if (existing.createdBy !== member.id) return c.json({ error: "forbidden" }, 403);
  const body = await c.req.json<{ title: string }>();
  if (!body.title?.trim()) return c.json({ error: "title required" }, 400);
  const taskId = `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  await db.insert(tasks).values({
    id: taskId,
    eventId: id,
    title: body.title.trim(),
    assigneeId: null,
    status: "unclaimed",
    claimedAt: null,
    doneAt: null,
  });
  const row = await db.select().from(tasks).where(eq(tasks.id, taskId)).get();
  return c.json(toTask(row!), 201);
});
