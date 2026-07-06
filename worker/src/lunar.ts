import { Lunar } from "lunar-typescript";

function pad(n: number) {
  return String(n).padStart(2, "0");
}
function ymd(y: number, m: number, d: number) {
  return `${y}-${pad(m)}-${pad(d)}`;
}

/** 事项是否落在指定阳历日（once/monthly/yearly）。 */
export function eventOccursOn(
  event: { date: string; recurrence: string },
  y: number,
  m: number,
  d: number,
): boolean {
  const [ey, em, ed] = event.date.split("-").map(Number);
  if (event.recurrence === "once") return event.date === ymd(y, m, d);
  if (event.recurrence === "monthly") return ed === d;
  return em === m && ed === d; // yearly
}

/** 成员生日是否落在指定阳历日（农历按当年转算）。 */
export function birthdayOnDay(
  u: { birthdayType: string; birthdayMonth: number; birthdayDay: number },
  y: number,
  m: number,
  d: number,
): boolean {
  let occY = y;
  let occM: number;
  let occD: number;
  if (u.birthdayType === "solar") {
    occM = u.birthdayMonth;
    occD = u.birthdayDay;
  } else {
    const s = Lunar.fromYmd(y, u.birthdayMonth, u.birthdayDay).getSolar();
    occY = s.getYear();
    occM = s.getMonth();
    occD = s.getDay();
  }
  return occY === y && occM === m && occD === d;
}
