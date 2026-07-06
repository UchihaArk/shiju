/** 原型用本地时区日期工具（禁用 UTC，保证倒计时按午夜计算）。 */

/** "YYYY-MM-DD"，月份从 1 开始。 */
export function ymd(year: number, month: number, day: number): string {
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function endOfDay(d: Date): Date {
  const s = startOfDay(d);
  return new Date(s.getFullYear(), s.getMonth(), s.getDate(), 23, 59, 59, 999);
}

export function startOfMonth(year: number, month: number): Date {
  // month: 1-12
  return new Date(year, month - 1, 1);
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/** 整天数差（b - a），向 0 取整，按本地午夜。 */
export function daysBetween(a: Date, b: Date): number {
  const ms = startOfDay(b).getTime() - startOfDay(a).getTime();
  return Math.round(ms / 86_400_000);
}

/** 原型"今天"，可用 NEXT_PUBLIC_DEMO_TODAY=YYYY-MM-DD 覆盖（逃生口）。 */
export function today(): Date {
  const override = process.env.NEXT_PUBLIC_DEMO_TODAY;
  if (override) {
    const [y, m, d] = override.split("-").map(Number);
    if (y && m && d) return new Date(y, m - 1, d);
  }
  return new Date();
}
