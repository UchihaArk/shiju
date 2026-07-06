"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, type CreateEventInput } from "./api";
import { clearAll, getUid, setUid } from "./identity";
import { MEMBERS } from "@/data/seed"; // API 不可用时的登录页兜底
import type { FamilyEvent, Member, Task } from "@/types";

interface StoreValue {
  hydrated: boolean;
  apiOnline: boolean;
  member: Member | null;
  members: Member[];
  events: FamilyEvent[];
  tasks: Task[];
  tasksByEvent: (eventId: string) => Task[];
  memberById: (id: string | null | undefined) => Member | undefined;
  pickMember: (m: Member) => void;
  logout: () => void;
  addEvent: (input: CreateEventInput) => Promise<FamilyEvent>;
  claimTask: (taskId: string) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  resetAll: () => void;
}

const Ctx = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [apiOnline, setApiOnline] = useState(true);
  const [member, setMember] = useState<Member | null>(null);
  const [members, setMembers] = useState<Member[]>(MEMBERS); // 兜底，hydrate 后替换为 API 数据
  const [events, setEvents] = useState<FamilyEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  // 挂载时拉取成员；若已登录再拉事件/任务。无论成败都解除启动页阻塞。
  useEffect(() => {
    let cancelled = false;
    const start = Date.now();
    (async () => {
      try {
        let ms: Member[];
        try {
          ms = await api.members();
          setApiOnline(true);
        } catch {
          ms = MEMBERS; // Worker 未启动时兜底，登录页仍可显示
          setApiOnline(false);
        }
        if (cancelled) return;
        setMembers(ms);

        const uid = getUid();
        if (uid) {
          const me = ms.find((m) => m.id === uid) ?? null;
          setMember(me);
          if (me) {
            try {
              const [es, ts] = await Promise.all([api.events(), api.tasks()]);
              if (cancelled) return;
              setEvents(es);
              setTasks(ts);
            } catch {
              /* API 不可用，留空 */
            }
          } else {
            setUid(null); // uid 失效
          }
        }
      } finally {
        // 启动图至少展示 600ms，避免一闪而过；且必定解除阻塞
        const elapsed = Date.now() - start;
        if (elapsed < 600) {
          await new Promise((r) => setTimeout(r, 600 - elapsed));
        }
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const pickMember = useCallback((m: Member) => {
    setUid(m.id);
    setMember(m);
  }, []);

  const logout = useCallback(() => {
    clearAll();
    setMember(null);
  }, []);

  const memberById = useCallback(
    (id: string | null | undefined) =>
      id ? members.find((m) => m.id === id) : undefined,
    [members],
  );

  const tasksByEvent = useCallback(
    (eventId: string) => tasks.filter((t) => t.eventId === eventId),
    [tasks],
  );

  const addEvent = useCallback(async (input: CreateEventInput) => {
    const { event, tasks: newTasks } = await api.createEvent(input);
    setEvents((prev) => [...prev, event]);
    setTasks((prev) => [...prev, ...newTasks]);
    return event;
  }, []);

  const claimTask = useCallback(async (taskId: string) => {
    const updated = await api.claimTask(taskId);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
  }, []);

  const completeTask = useCallback(async (taskId: string) => {
    const updated = await api.completeTask(taskId);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
  }, []);

  const resetAll = useCallback(() => {
    clearAll();
    setMember(null);
    setEvents([]);
    setTasks([]);
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      hydrated,
      apiOnline,
      member,
      members,
      events,
      tasks,
      tasksByEvent,
      memberById,
      pickMember,
      logout,
      addEvent,
      claimTask,
      completeTask,
      resetAll,
    }),
    [
      hydrated,
      apiOnline,
      member,
      members,
      events,
      tasks,
      tasksByEvent,
      memberById,
      pickMember,
      logout,
      addEvent,
      claimTask,
      completeTask,
      resetAll,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): StoreValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore 必须在 <StoreProvider> 内使用");
  return v;
}
