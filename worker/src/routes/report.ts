import { Hono } from "hono";
import { count, eq, inArray } from "drizzle-orm";
import { getDb } from "../db";
import { events, tasks, users } from "../schema";
import { requireMember } from "../auth";
import type { AppEnv } from "../types";

export const reportRouter = new Hono<{ Bindings: AppEnv }>();
reportRouter.use("*", requireMember);

reportRouter.get("/", async (c) => {
  const db = getDb(c.env.DB);
  const [members, allEvents, allTasks, doneRow, claimRows, publishRows] = await Promise.all([
    db.select().from(users).all(),
    db.select().from(events).all(),
    db.select().from(tasks).all(),
    db.select({ n: count() }).from(tasks).where(eq(tasks.status, "done")).get(),
    db
      .select({ id: tasks.assigneeId, n: count() })
      .from(tasks)
      .where(inArray(tasks.status, ["claimed", "done"]))
      .groupBy(tasks.assigneeId),
    db.select({ id: events.createdBy, n: count() }).from(events).groupBy(events.createdBy),
  ]);

  const doneCount = doneRow?.n ?? 0;
  const claimMap = new Map(
    claimRows.filter((r) => r.id).map((r) => [r.id as string, r.n] as const),
  );
  const publishMap = new Map(publishRows.map((r) => [r.id, r.n] as const));

  // 月度事件分布（1-12）
  const monthCounts = new Array(12).fill(0) as number[];
  for (const e of allEvents) {
    const m = Number(e.date.slice(5, 7));
    if (m >= 1 && m <= 12) monthCounts[m - 1]++;
  }
  const maxMonthCount = Math.max(0, ...monthCounts);
  const busiestMonth = monthCounts.indexOf(maxMonthCount) + 1;

  const memberStats = members.map((m) => ({
    id: m.id,
    role: m.role,
    emoji: m.emoji,
    color: m.color,
    claims: claimMap.get(m.id) ?? 0,
    publishes: publishMap.get(m.id) ?? 0,
  }));

  return c.json({
    doneCount,
    totalEvents: allEvents.length,
    totalTasks: allTasks.length,
    completionRate: allTasks.length ? Math.round((doneCount / allTasks.length) * 100) : 0,
    busiestMonth,
    busiestMonthCount: maxMonthCount,
    monthCounts,
    memberStats,
  });
});
