import { Hono } from "hono";
import { like } from "drizzle-orm";
import { getDb } from "../db";
import { holidays } from "../schema";
import { syncHolidays } from "../holidays-sync";
import { requireMember } from "../auth";
import type { AppEnv } from "../types";

export const holidaysRouter = new Hono<{ Bindings: AppEnv }>();

/** 某年节假日（前端日历用）。 */
holidaysRouter.get("/", requireMember, async (c) => {
  const year = Number(c.req.query("year") ?? new Date().getFullYear());
  const db = getDb(c.env.DB);
  const rows = await db
    .select()
    .from(holidays)
    .where(like(holidays.date, `${year}-%`))
    .all();
  return c.json(rows.map((r) => ({ date: r.date, name: r.name, type: r.type })));
});

/** 手动触发同步（部署后跑一次；每年新数据发布后再跑）。 */
holidaysRouter.post("/sync", requireMember, async (c) => {
  const year = Number(c.req.query("year") ?? new Date().getFullYear());
  const n = await syncHolidays(c.env, year);
  return c.json({ ok: true, year, count: n });
});
