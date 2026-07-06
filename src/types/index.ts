/**
 * 原型数据类型 —— 与最终 Drizzle 表对齐，方便 Phase 2 迁移：
 * Member → users, Event → events, Task → tasks
 */

export type Role = "爸爸" | "妈妈" | "爷爷" | "奶奶" | "小满";

/** 暖色点缀板 key（对应 AccentChip 配色）。 */
export type AccentColor =
  | "rose"
  | "pink"
  | "amber"
  | "orange"
  | "leaf";

export type Recurrence = "once" | "monthly" | "yearly";
export type BirthdayType = "solar" | "lunar";
export type TaskStatus = "unclaimed" | "claimed" | "done";

export interface Member {
  id: string;
  role: Role;
  name: string; // 显示名，如"爸爸 · 大勇"
  shortName: string; // 简称，如"大勇"
  emoji: string;
  color: AccentColor;
  birthdayType: BirthdayType;
  /** month/day；lunar 时为农历月、日。年份忽略，按年循环。 */
  birthday: { month: number; day: number };
}

export interface Task {
  id: string;
  eventId: string;
  title: string;
  assigneeId: string | null; // 认领人；null = 等待认领
  status: TaskStatus;
  claimedAt?: string;
  doneAt?: string;
}

export interface FamilyEvent {
  id: string;
  title: string;
  note?: string;
  /** "YYYY-MM-DD"（阳历）。 */
  date: string;
  recurrence: Recurrence;
  createdBy: string;
  color: AccentColor;
  subjectId: string | null; // 主角 / 围绕者
  taskIds: string[];
}

export interface HolidayInfo {
  type: "holiday" | "workday"; // holiday=放假(休)，workday=调休上班(班)
  name: string;
}

export interface DayCalendar {
  solarDate: string;
  y: number;
  m: number;
  d: number;
  weekday: number; // 0=周日
  inMonth: boolean;
  lunarText: string; // "五月十九"
  lunarDayText: string; // "十九" —— 网格小字用
  jieQi?: string; // "小暑"
  solarFestivals: string[];
  lunarFestivals: string[];
  holiday?: HolidayInfo;
  isToday: boolean;
  events: FamilyEvent[];
  birthdays: Member[];
}

export interface PersistedState {
  events: FamilyEvent[];
  tasks: Task[];
}
