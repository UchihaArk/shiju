/** Worker 绑定/变量。运行时类型（D1Database 等）来自 wrangler 生成的 worker-configuration.d.ts。 */
export type AppEnv = {
  DB: D1Database;
  CORS_ORIGIN: string;
  VAPID_PUBLIC_KEY: string;
  VAPID_PRIVATE_KEY: string;
  VAPID_SUBJECT: string;
};

export type BirthdayType = "solar" | "lunar";
export type Recurrence = "once" | "monthly" | "yearly";
export type TaskStatus = "unclaimed" | "claimed" | "done";

/** 返回给前端的 DTO（与前端 src/types/index.ts 形状一致）。 */
export interface MemberDTO {
  id: string;
  name: string;
  shortName: string;
  role: string;
  emoji: string;
  color: string;
  birthdayType: BirthdayType;
  birthday: { month: number; day: number };
}

export interface TaskDTO {
  id: string;
  eventId: string;
  title: string;
  assigneeId: string | null;
  status: TaskStatus;
  claimedAt: string | null;
  doneAt: string | null;
}

export interface EventDTO {
  id: string;
  title: string;
  note?: string | null;
  date: string;
  recurrence: Recurrence;
  createdBy: string;
  color: string;
  subjectIds: string[];
  taskIds: string[];
}
