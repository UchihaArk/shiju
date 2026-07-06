import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

/** 家庭成员（→ 前端 Member） */
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  shortName: text("short_name").notNull(),
  role: text("role").notNull(),
  emoji: text("emoji").notNull(),
  color: text("color").notNull(),
  birthdayType: text("birthday_type").notNull(), // 'solar' | 'lunar'
  birthdayMonth: integer("birthday_month").notNull(),
  birthdayDay: integer("birthday_day").notNull(),
});

/** 事项（→ 前端 FamilyEvent） */
export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  note: text("note"),
  date: text("date").notNull(), // 'YYYY-MM-DD'（阳历）
  recurrence: text("recurrence").notNull(), // 'once' | 'monthly' | 'yearly'
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id),
  color: text("color").notNull(),
  subjectId: text("subject_id").references(() => users.id), // 主角/围绕者（可空）
});

/** 子任务（→ 前端 Task，认领机制） */
export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  eventId: text("event_id")
    .notNull()
    .references(() => events.id),
  title: text("title").notNull(),
  assigneeId: text("assignee_id").references(() => users.id), // null = 等待认领
  status: text("status").notNull(), // 'unclaimed' | 'claimed' | 'done'
  claimedAt: text("claimed_at"),
  doneAt: text("done_at"),
});

/** Web Push 订阅 */
export const subscriptions = sqliteTable("subscriptions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: text("created_at").notNull(),
});

/** 法定节假日 + 调休（由 Cron 从 holiday-cn 同步） */
export const holidays = sqliteTable("holidays", {
  date: text("date").primaryKey(), // 'YYYY-MM-DD'
  name: text("name").notNull(),
  type: text("type").notNull(), // 'holiday' = 放假，'workday' = 调休上班
});
