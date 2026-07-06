import { count, like } from "drizzle-orm";
import { getDb } from "./db";
import { holidays } from "./schema";
import type { AppEnv } from "./types";

/** 开源节假日数据源：NateScarlet/holiday-cn（每年一个 JSON）。 */
const SOURCE = (year: number) =>
  `https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/${year}.json`;

interface HolidayCNDay {
  name: string;
  date: string;
  isOffDay: boolean;
}

/** 拉取某年节假日并覆盖写入 D1（删该年再插，幂等）。返回写入条数。 */
export async function syncHolidays(env: AppEnv, year: number): Promise<number> {
  const res = await fetch(SOURCE(year));
  if (!res.ok) throw new Error(`holiday-cn ${year} HTTP ${res.status}`);
  const data = (await res.json()) as { days?: HolidayCNDay[] };
  const rows = (data.days ?? []).map((d) => ({
    date: d.date,
    name: d.name,
    type: d.isOffDay ? ("holiday" as const) : ("workday" as const),
  }));

  const db = getDb(env.DB);
  await db.delete(holidays).where(like(holidays.date, `${year}-%`));
  // 分块插入（D1 单语句绑定参数有上限，39×3 会触发 "too many SQL variables"）
  for (let i = 0; i < rows.length; i += 10) {
    await db.insert(holidays).values(rows.slice(i, i + 10));
  }
  return rows.length;
}

/** 该年是否已有节假日数据（Cron 用：避免每天重复拉取）。 */
export async function hasHolidays(env: AppEnv, year: number): Promise<boolean> {
  const db = getDb(env.DB);
  const row = await db
    .select({ n: count() })
    .from(holidays)
    .where(like(holidays.date, `${year}-%`))
    .get();
  return (row?.n ?? 0) > 0;
}
