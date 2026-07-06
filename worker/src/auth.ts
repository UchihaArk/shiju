import { createMiddleware } from "hono/factory";
import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { users } from "./schema";
import { toMember } from "./serialize";
import type { AppEnv, MemberDTO } from "./types";

/** 座位牌免密鉴权：读 x-user-id 头，查 D1 校验，注入 member。 */
export const requireMember = createMiddleware<{
  Bindings: AppEnv;
  Variables: { member: MemberDTO };
}>(async (c, next) => {
  const userId = c.req.header("x-user-id");
  if (!userId) return c.json({ error: "missing x-user-id" }, 401);
  const db = getDb(c.env.DB);
  const row = await db.select().from(users).where(eq(users.id, userId)).get();
  if (!row) return c.json({ error: "unknown user" }, 401);
  c.set("member", toMember(row));
  await next();
});
