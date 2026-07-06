import { Hono } from "hono";
import { getDb } from "../db";
import { users } from "../schema";
import { toMember } from "../serialize";
import type { AppEnv } from "../types";

export const members = new Hono<{ Bindings: AppEnv }>();

/** 公开：列出家庭成员（座位牌）。免密模式下任何人可选座。 */
members.get("/", async (c) => {
  const db = getDb(c.env.DB);
  const rows = await db.select().from(users).all();
  return c.json(rows.map(toMember));
});
