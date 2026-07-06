import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { events, subscriptions, users } from "./schema";
import { birthdayOnDay, eventOccursOn } from "./lunar";
import { hasHolidays, syncHolidays } from "./holidays-sync";
import { initPush, sendPush } from "./push";
import type { AppEnv } from "./types";

/** 每晚 20:00(北京)=12:00 UTC 触发：① 同步节假日（缺哪年补哪年）② 找明天的生日 + 事项推送。 */
export async function runCron(env: AppEnv) {
  const db = getDb(env.DB);
  initPush(env);

  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const ty = tomorrow.getFullYear();
  const tm = tomorrow.getMonth() + 1;
  const td = tomorrow.getDate();

  // ① 节假日自愈：本年/次年缺数据才拉取（每年最多一次）
  for (const y of [now.getFullYear(), now.getFullYear() + 1]) {
    if (!(await hasHolidays(env, y))) {
      try {
        const n = await syncHolidays(env, y);
        console.log(`[cron] 同步节假日 ${y}：${n} 条`);
      } catch (e) {
        console.warn(`[cron] 同步节假日 ${y} 失败：`, (e as Error).message);
      }
    }
  }

  const [allEvents, allUsers, allSubs] = await Promise.all([
    db.select().from(events).all(),
    db.select().from(users).all(),
    db.select().from(subscriptions).all(),
  ]);

  const tomEvents = allEvents.filter((e) => eventOccursOn(e, ty, tm, td));
  const tomBirthdays = allUsers.filter((u) => birthdayOnDay(u, ty, tm, td));

  console.log(
    `[cron] 明天 ${tm}/${td}: 事项 ${tomEvents.length}, 生日 ${tomBirthdays.length}, 订阅 ${allSubs.length}`,
  );

  if (tomEvents.length === 0 && tomBirthdays.length === 0) return;

  const lines: string[] = [];
  for (const u of tomBirthdays) lines.push(`${u.role}明天生日🎂`);
  for (const e of tomEvents.slice(0, 3)) lines.push(e.title);
  let body = lines.join("、");
  if (tomEvents.length > 3) body += ` 等${tomEvents.length}项`;
  const title = tomBirthdays.length > 0 ? "明日家庭提醒" : `明日 ${tomEvents.length} 项事项`;

  const dead: string[] = [];
  await Promise.all(
    allSubs.map(async (s) => {
      const ok = await sendPush(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        { title, body, data: { url: "/" } },
      );
      if (!ok) dead.push(s.endpoint);
    }),
  );
  for (const ep of dead) {
    await db.delete(subscriptions).where(eq(subscriptions.endpoint, ep));
  }
  console.log(`[cron] 推送完成 ${allSubs.length - dead.length}/${allSubs.length}，清理失效 ${dead.length}`);
}
