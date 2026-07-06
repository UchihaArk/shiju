import type { FamilyEvent, Member, Task } from "@/types";

/** 5 位家庭成员（与最终 users 表对齐）。生日围绕 2026-07-03 调优。 */
export const MEMBERS: Member[] = [
  {
    id: "u_ba",
    role: "爸爸",
    name: "爸爸 · 宇航",
    shortName: "宇航",
    emoji: "👨",
    color: "orange",
    birthdayType: "lunar",
    birthday: { month: 7, day: 9 },
  },
  {
    id: "u_ma",
    role: "妈妈",
    name: "妈妈 · 佳琪",
    shortName: "佳琪",
    emoji: "👩",
    color: "rose",
    birthdayType: "lunar",
    birthday: { month: 9, day: 12 },
  },
  {
    id: "u_ye",
    role: "爷爷",
    name: "爷爷 · 豪子",
    shortName: "豪子",
    emoji: "👴",
    color: "amber",
    birthdayType: "lunar",
    birthday: { month: 10, day: 8 },
  },
  {
    id: "u_nai",
    role: "奶奶",
    name: "奶奶 · 梅子",
    shortName: "梅子",
    emoji: "👵",
    color: "leaf",
    birthdayType: "lunar",
    birthday: { month: 1, day: 28 },
  },
  {
    id: "u_xm",
    role: "小满",
    name: "小满 · 小满",
    shortName: "小满",
    emoji: "🧒",
    color: "pink",
    birthdayType: "solar",
    birthday: { month: 6, day: 23 },
  },
  {
    id: "u_duole",
    role: "宠物",
    name: "宠物 · 多乐",
    shortName: "多乐",
    emoji: "🐶",
    color: "tan",
    birthdayType: "solar",
    birthday: { month: 5, day: 15 },
  },
];

export const MEMBER_BY_ID: Record<string, Member> = Object.fromEntries(
  MEMBERS.map((m) => [m.id, m]),
);

/** ~10 条事项，跨过去 / 今日 / 未来，子任务覆盖三态。 */
export const SEED_EVENTS = [
  {
    id: "e_outing",
    title: "全家郊游踏青",
    note: "带上野餐垫和水壶，目的地：植物园",
    date: "2026-06-28",
    recurrence: "once",
    createdBy: "u_ma",
    color: "leaf",
    taskIds: ["t_outing_1", "t_outing_2"],
  },
  {
    id: "e_laundry",
    title: "换洗床单被罩",
    date: "2026-07-03",
    recurrence: "monthly",
    createdBy: "u_ma",
    color: "orange",
    taskIds: ["t_laundry_1", "t_laundry_2"],
  },
  {
    id: "e_meeting",
    title: "小满家长会",
    note: "下午 4 点，三年级 (2) 班",
    date: "2026-07-05",
    recurrence: "once",
    createdBy: "u_ba",
    color: "amber",
    taskIds: ["t_meeting_1"],
  },
  {
    id: "e_xiaoshu",
    title: "小暑 · 煲绿豆汤",
    note: "节气养生，全家降火",
    date: "2026-07-07",
    recurrence: "yearly",
    createdBy: "u_nai",
    color: "leaf",
    taskIds: ["t_xiaoshu_1"],
  },
  {
    id: "e_mamabday",
    title: "妈妈生日聚会",
    note: "今年一起在家吃长寿面 🎂",
    date: "2026-07-09",
    recurrence: "once",
    createdBy: "u_ba",
    color: "pink",
    taskIds: ["t_mamabday_1", "t_mamabday_2"],
  },
  {
    id: "e_familymtg",
    title: "月度家庭会议",
    date: "2026-07-12",
    recurrence: "monthly",
    createdBy: "u_ba",
    color: "rose",
    taskIds: ["t_familymtg_1"],
  },
  {
    id: "e_ac",
    title: "空调清洗",
    date: "2026-07-25",
    recurrence: "once",
    createdBy: "u_ma",
    color: "orange",
    taskIds: ["t_ac_1", "t_ac_2"],
  },
  {
    id: "e_property",
    title: "缴物业费 + 宽带续费",
    date: "2026-06-20",
    recurrence: "monthly",
    createdBy: "u_ba",
    color: "rose",
    taskIds: ["t_property_1"],
  },
  {
    id: "e_grandpa",
    title: "爷爷复诊",
    note: "心内科，记得带医保卡",
    date: "2026-08-15",
    recurrence: "once",
    createdBy: "u_ma",
    color: "amber",
    taskIds: ["t_grandpa_1"],
  },
  {
    id: "e_hometown",
    title: "全家回老家",
    date: "2026-08-20",
    recurrence: "once",
    createdBy: "u_ye",
    color: "leaf",
    taskIds: ["t_hometown_1"],
  },
];

export const SEED_TASKS = [
  // 郊游（过去，全部完成）
  { id: "t_outing_1", eventId: "e_outing", title: "准备野餐食物", assigneeId: "u_ma", status: "done", doneAt: "2026-06-27T20:00:00.000Z" },
  { id: "t_outing_2", eventId: "e_outing", title: "开车接送", assigneeId: "u_ba", status: "done", doneAt: "2026-06-27T21:00:00.000Z" },
  // 换洗床单（今日：1 待认领 + 1 已认领）
  { id: "t_laundry_1", eventId: "e_laundry", title: "拆洗床单被罩", assigneeId: null, status: "unclaimed" },
  { id: "t_laundry_2", eventId: "e_laundry", title: "晾晒收纳", assigneeId: "u_ba", status: "claimed", claimedAt: "2026-07-02T22:00:00.000Z" },
  // 家长会（待认领）
  { id: "t_meeting_1", eventId: "e_meeting", title: "去学校开家长会", assigneeId: null, status: "unclaimed" },
  // 小暑（待认领）
  { id: "t_xiaoshu_1", eventId: "e_xiaoshu", title: "煲一锅绿豆汤", assigneeId: null, status: "unclaimed" },
  // 妈妈生日（1 已认领 + 1 待认领）
  { id: "t_mamabday_1", eventId: "e_mamabday", title: "预订生日蛋糕", assigneeId: "u_ye", status: "claimed", claimedAt: "2026-07-01T10:00:00.000Z" },
  { id: "t_mamabday_2", eventId: "e_mamabday", title: "布置客厅气球", assigneeId: null, status: "unclaimed" },
  // 家庭会议（待认领）
  { id: "t_familymtg_1", eventId: "e_familymtg", title: "记录会议要点", assigneeId: null, status: "unclaimed" },
  // 空调清洗（全待认领，演示认领流程）
  { id: "t_ac_1", eventId: "e_ac", title: "联系清洗师傅", assigneeId: null, status: "unclaimed" },
  { id: "t_ac_2", eventId: "e_ac", title: "擦拭空调外壳", assigneeId: null, status: "unclaimed" },
  // 物业费（已完成）
  { id: "t_property_1", eventId: "e_property", title: "线上缴费", assigneeId: "u_ba", status: "done", doneAt: "2026-06-20T09:00:00.000Z" },
  // 爷爷复诊（已认领）
  { id: "t_grandpa_1", eventId: "e_grandpa", title: "开车陪诊", assigneeId: "u_ba", status: "claimed", claimedAt: "2026-07-02T08:00:00.000Z" },
  // 回老家（待认领）
  { id: "t_hometown_1", eventId: "e_hometown", title: "买高铁票", assigneeId: null, status: "unclaimed" },
];

export const SEED = {
  events: SEED_EVENTS,
  tasks: SEED_TASKS,
};
