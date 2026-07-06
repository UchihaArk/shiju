import type { AccentColor, FamilyEvent, Member, Recurrence, Task } from "@/types";
import { getUid } from "./identity";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = init?.body ? { "Content-Type": "application/json" } : {};
  const uid = getUid();
  if (uid) headers["x-user-id"] = uid;
  // 超时保护：移动端网络挂起时强制中止，避免卡在启动页
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);
  try {
    const res = await fetch(`${BASE}${path}`, { ...init, headers, signal: controller.signal });
    if (!res.ok) {
      throw Object.assign(new Error(`${res.status} ${path}`), { status: res.status });
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

export interface CreateEventInput {
  title: string;
  note?: string;
  date: string;
  recurrence: Recurrence;
  color: AccentColor;
  subtasks: string[];
}

export const api = {
  members: () => req<Member[]>("/api/members"),
  events: () => req<FamilyEvent[]>("/api/events"),
  tasks: () => req<Task[]>("/api/tasks"),
  createEvent: (input: CreateEventInput) =>
    req<{ event: FamilyEvent; tasks: Task[] }>("/api/events", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  claimTask: (id: string) => req<Task>(`/api/tasks/${id}/claim`, { method: "POST" }),
  completeTask: (id: string) => req<Task>(`/api/tasks/${id}/complete`, { method: "POST" }),
  registerSubscription: (s: { endpoint: string; keys: { p256dh: string; auth: string } }) =>
    req("/api/subscriptions", { method: "POST", body: JSON.stringify(s) }),
  unregisterSubscription: (endpoint: string) =>
    req("/api/subscriptions", { method: "DELETE", body: JSON.stringify({ endpoint }) }),
  testPush: () => req<{ ok: boolean; sent: number; total: number }>("/api/subscriptions/test", { method: "POST" }),
  report: () => req<ReportData>("/api/report"),
  holidays: (year: number) =>
    req<{ date: string; name: string; type: "holiday" | "workday" }[]>(
      `/api/holidays?year=${year}`,
    ),
};

export interface MemberStat {
  id: string;
  role: string;
  emoji: string;
  color: string;
  claims: number;
  publishes: number;
}

export interface ReportData {
  doneCount: number;
  totalEvents: number;
  totalTasks: number;
  completionRate: number;
  busiestMonth: number;
  busiestMonthCount: number;
  monthCounts: number[];
  memberStats: MemberStat[];
}
