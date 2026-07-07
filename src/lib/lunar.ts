import { Solar, Lunar } from "lunar-typescript";
import { ymd, startOfDay, endOfDay, startOfMonth, addDays, daysBetween, today as todayDate } from "./date";
import type { DayCalendar, FamilyEvent, HolidayInfo, Member } from "@/types";

const HAN = /[一-鿿]/;

/** 构建某月的节气 {日期key: 节气名}，过滤掉英文回退键（如 DA_XUE），只留 24 节气中文名。 */
function buildJieQiMap(year: number): Map<string, string> {
  const table = Lunar.fromYmd(year, 1, 1).getJieQiTable() as Record<string, Solar>;
  const map = new Map<string, string>();
  for (const [name, solar] of Object.entries(table)) {
    if (!HAN.test(name)) continue; // 跳过英文回退键
    const key = ymd(solar.getYear(), solar.getMonth(), solar.getDay());
    // 同一天可能被相邻年份表覆盖，保留即可
    map.set(key, name);
  }
  return map;
}

/** 事件是否落在指定阳历日（处理 once/monthly/yearly 循环）。 */
export function eventOccursOn(event: FamilyEvent, y: number, m: number, d: number): boolean {
  const key = ymd(y, m, d);
  // 循环事项从其起始日（event.date，即新建日）开始发生，起始日之前不算
  if (key < event.date) return false;
  if (event.recurrence === "once") return key === event.date;
  const [, em, ed] = event.date.split("-").map(Number);
  if (event.recurrence === "monthly") return ed === d;
  // yearly：同月同日
  return em === m && ed === d;
}

/** 成员生日是否落在指定阳历日（农历按当年转算）。 */
export function birthdayOnDay(member: Member, y: number, m: number, d: number): boolean {
  const occ = lunarToSolarOccurrence(member, y);
  return occ.y === y && occ.m === m && occ.d === d;
}

/** 成员生日在某阳历年的发生日（农历→阳历）。 */
function lunarToSolarOccurrence(member: Member, year: number) {
  if (member.birthdayType === "solar") {
    return { y: year, m: member.birthday.month, d: member.birthday.day };
  }
  const solar = Lunar.fromYmd(year, member.birthday.month, member.birthday.day).getSolar();
  return { y: solar.getYear(), m: solar.getMonth(), d: solar.getDay() };
}

/** 构建月历 42 格，并把事件 / 生日挂到每一天。 */
export function getMonthCalendar(
  year: number,
  month: number, // 1-12
  opts: { events: FamilyEvent[]; members: Member[]; holidays: Record<string, HolidayInfo>; now?: Date },
): DayCalendar[] {
  const now = opts.now ?? todayDate();
  const first = startOfMonth(year, month);
  const gridStart = addDays(first, -first.getDay()); // 从周日开始
  const jieQi = buildJieQiMap(year);
  const todayKey = ymd(now.getFullYear(), now.getMonth() + 1, now.getDate());

  const days: DayCalendar[] = [];
  for (let i = 0; i < 42; i++) {
    const date = addDays(gridStart, i);
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const key = ymd(y, m, d);
    const solar = Solar.fromYmd(y, m, d);
    const lunar = solar.getLunar();
    const dayInChinese = lunar.getDayInChinese();

    days.push({
      solarDate: key,
      y,
      m,
      d,
      weekday: date.getDay(),
      inMonth: m === month,
      lunarText: `${lunar.getMonthInChinese()}月${dayInChinese}`,
      lunarDayText: dayInChinese === "初一" ? lunar.getMonthInChinese() + "月" : dayInChinese,
      jieQi: jieQi.get(key),
      solarFestivals: solar.getFestivals(),
      lunarFestivals: lunar.getFestivals(),
      holiday: opts.holidays[key],
      isToday: key === todayKey,
      events: opts.events.filter((e) => eventOccursOn(e, y, m, d)),
      birthdays: opts.members.filter((mb) => birthdayOnDay(mb, y, m, d)),
    });
  }
  return days;
}

/** 成员下一个生日（阳历 Date + 距今天数）。 */
export function nextBirthday(
  member: Member,
  now: Date = todayDate(),
): { date: Date; days: number } {
  const tY = now.getFullYear();
  for (const yr of [tY, tY + 1]) {
    const occ = lunarToSolarOccurrence(member, yr);
    const occDate = new Date(occ.y, occ.m - 1, occ.d);
    const days = daysBetween(now, occDate);
    if (days >= 0) return { date: occDate, days };
  }
  return { date: new Date(tY + 1, 11, 31), days: 365 };
}

/** 7 天内的生日倒计时（首页用）。 */
export function birthdayCountdown(
  members: Member[],
  withinDays = 7,
  now: Date = todayDate(),
): { member: Member; date: Date; days: number }[] {
  return members
    .map((member) => ({ member, ...nextBirthday(member, now) }))
    .filter((x) => x.days <= withinDays)
    .sort((a, b) => a.days - b.days);
}

/** 事项从 fromDate 起「下一次」发生的日期（处理 once/monthly/yearly）。 */
export function nextOccurrence(event: FamilyEvent, fromDate: Date): Date | null {
  const [, em, ed] = event.date.split("-").map(Number);
  const start = startOfDay(fromDate);

  if (event.recurrence === "once") {
    const [y, m, d] = event.date.split("-").map(Number);
    const occ = new Date(y, m - 1, d);
    return occ >= start ? occ : null;
  }

  if (event.recurrence === "monthly") {
    let y = start.getFullYear();
    let m = start.getMonth(); // 0-based
    for (let i = 0; i < 24; i++) {
      const occ = new Date(y, m, ed);
      if (occ.getMonth() === m && occ >= start) return occ;
      m++;
      if (m > 11) {
        m = 0;
        y++;
      }
    }
    return null;
  }

  // yearly
  let y = start.getFullYear();
  for (let i = 0; i < 3; i++) {
    const occ = new Date(y, em - 1, ed);
    if (occ >= start) return occ;
    y++;
  }
  return null;
}

/** 某阳历日的农历文本，如 "五月十九"。 */
export function lunarTextOf(date: Date): string {
  const lunar = Solar.fromYmd(date.getFullYear(), date.getMonth() + 1, date.getDate()).getLunar();
  return `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;
}

/** 事项在 [start, end] 区间内的所有发生日（once/monthly/yearly 全展开）。归档页用。 */
export function occurrencesInRange(event: FamilyEvent, start: Date, end: Date): Date[] {
  const out: Date[] = [];
  const [ey, em, ed] = event.date.split("-").map(Number);
  const anchor = new Date(ey, em - 1, ed); // 事项起始日（新建日）
  const s = startOfDay(start);
  const e = endOfDay(end);
  // 循环事项不早于起始日发生
  const lower = s < anchor ? anchor : s;
  const inRange = (d: Date) => d >= lower && d <= e;

  if (event.recurrence === "once") {
    const [y, m, d] = event.date.split("-").map(Number);
    const occ = new Date(y, m - 1, d);
    if (inRange(occ)) out.push(occ);
    return out;
  }

  if (event.recurrence === "monthly") {
    let y = s.getFullYear();
    let m = s.getMonth(); // 0-based
    for (let i = 0; i < 60; i++) {
      if (new Date(y, m, 1) > e) break;
      const occ = new Date(y, m, ed);
      if (occ.getMonth() === m && inRange(occ)) out.push(occ);
      m++;
      if (m > 11) {
        m = 0;
        y++;
      }
    }
    return out;
  }

  // yearly
  for (let yr = s.getFullYear(); yr <= e.getFullYear() + 1; yr++) {
    const occ = new Date(yr, em - 1, ed);
    if (inRange(occ)) out.push(occ);
    if (occ > e) break;
  }
  return out;
}
