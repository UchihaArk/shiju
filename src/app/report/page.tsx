"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/theme/AppShell";
import { GlassCard } from "@/components/theme/GlassCard";
import { useStore } from "@/lib/store";
import { api, type ReportData } from "@/lib/api";
import { Splash } from "@/components/ui/Splash";
import { ACCENT } from "@/lib/colors";
import { cn } from "@/lib/cn";

const CN_MONTHS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
const EMPTY_MONTHS = new Array(12).fill(0) as number[];

export default function ReportPage() {
  const router = useRouter();
  const { hydrated, member } = useStore();
  const [data, setData] = useState<ReportData | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    if (hydrated && !member) router.replace("/login");
  }, [hydrated, member, router]);

  useEffect(() => {
    if (member) api.report().then(setData).catch(() => setErr(true));
  }, [member]);

  if (!hydrated || !member) return <Splash />;

  // 结构常驻、数据兜底，避免每次重新挂载组件
  const doneCount = data?.doneCount ?? 0;
  const totalEvents = data?.totalEvents ?? 0;
  const totalTasks = data?.totalTasks ?? 0;
  const completionRate = data?.completionRate ?? 0;
  const monthCounts = data?.monthCounts ?? EMPTY_MONTHS;
  const busiestMonth = data?.busiestMonth ?? 0;
  const busiestMonthCount = data?.busiestMonthCount ?? 0;
  const memberStats = data?.memberStats ?? [];
  const subjectStats = data?.subjectStats ?? [];
  const maxClaims = Math.max(1, ...memberStats.map((m) => m.claims));
  const maxSubject = Math.max(1, ...subjectStats.map((s) => s.count));
  const maxMonth = Math.max(1, ...monthCounts);
  const loading = !data && !err;

  return (
    <AppShell
      top={
        <>
          <h1 className="mb-1 px-1 text-xl font-bold text-rose-deep">家庭年度报告</h1>
          <p className="mb-1 px-1 text-[11px] text-rose-deep/50">
            数据来自全家共享的家庭大盘{loading ? " · 生成中…" : ""}
          </p>
        </>
      }
    >

      {/* KPI */}
      <div className="mb-3 grid grid-cols-3 gap-2">
        <Kpi label="完成待办" value={doneCount} sub={`完成率 ${completionRate}%`} color="leaf" />
        <Kpi label="总事项" value={totalEvents} sub="条记录" color="rose" />
        <Kpi label="总任务" value={totalTasks} sub="项子任务" color="amber" />
      </div>

      {/* 月度趋势 */}
      <GlassCard className="mb-3 px-4 py-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-rose-deep">月度事项分布</h2>
          <span className="text-xs text-rose-deep/55">
            最忙 {busiestMonth ? CN_MONTHS[busiestMonth - 1] : "—"} · {busiestMonthCount} 项
          </span>
        </div>
        <div className="flex h-28 items-end justify-between gap-1">
          {monthCounts.map((n, i) => {
            const isMax = n === maxMonth && n > 0;
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className={cn(
                      "w-full rounded-t-md transition-all",
                      isMax ? "bg-gradient-to-t from-rose to-orange" : "bg-rose/30",
                    )}
                    style={{ height: `${(n / maxMonth) * 100}%`, minHeight: n > 0 ? 4 : 0 }}
                  />
                </div>
                <span className="text-[9px] text-rose-deep/45">{i + 1}</span>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* 围绕角色 · 主角榜（已置于贡献榜之上） */}
      <GlassCard className="mb-3 px-4 py-4">
        <h2 className="mb-3 text-sm font-semibold text-rose-deep">围绕角色 · 主角榜</h2>
        {subjectStats.length === 0 ? (
          <p className="py-4 text-center text-xs text-rose-deep/40">还没有标记主角的事项</p>
        ) : (
          <div className="space-y-3">
            {subjectStats.map((s) => (
              <div key={s.id} className="flex items-center gap-3">
                <div
                  className={cn(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-xl text-lg",
                    ACCENT[s.color as keyof typeof ACCENT]?.soft,
                  )}
                >
                  {s.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between text-[11px]">
                    <span className="font-medium text-rose-deep">{s.role}</span>
                    <span className="text-rose-deep/50">{s.count} 项</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/50">
                    <div
                      className="h-full rounded-full bg-pink transition-all"
                      style={{ width: `${(s.count / maxSubject) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* 家人贡献榜 */}
      <GlassCard className="px-4 py-4">
        <h2 className="mb-3 text-sm font-semibold text-rose-deep">家人贡献榜</h2>
        <div className="space-y-3">
          {memberStats.length === 0 ? (
            <p className="py-4 text-center text-xs text-rose-deep/40">
              {loading ? "生成中…" : "暂无数据"}
            </p>
          ) : (
            memberStats.map((m) => (
              <div key={m.id} className="flex items-center gap-3">
                <div
                  className={cn(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-xl text-lg",
                    ACCENT[m.color as keyof typeof ACCENT]?.soft,
                  )}
                >
                  {m.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between text-[11px]">
                    <span className="font-medium text-rose-deep">{m.role}</span>
                    <span className="text-rose-deep/50">认领 {m.claims} · 发布 {m.publishes}</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/50">
                      <div
                        className="h-full rounded-full bg-rose transition-all"
                        style={{ width: `${(m.claims / maxClaims) * 100}%` }}
                      />
                    </div>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/50">
                      <div
                        className="h-full rounded-full bg-amber transition-all"
                        style={{ width: `${Math.min(100, (m.publishes / maxClaims) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <p className="mt-3 text-[10px] text-rose-deep/40">
          <span className="inline-block h-1.5 w-3 rounded-full bg-rose align-middle" /> 认领
          <span className="ml-2 inline-block h-1.5 w-3 rounded-full bg-amber align-middle" /> 发布
        </p>
      </GlassCard>

      {err && (
        <p className="mt-3 text-center text-xs text-rose-deep/40">报告加载失败，请确认后端已启动 🤔</p>
      )}
    </AppShell>
  );
}

function Kpi({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: number;
  sub: string;
  color: "rose" | "amber" | "leaf";
}) {
  const textCls = { rose: "text-rose-deep", amber: "text-amber-deep", leaf: "text-leaf-deep" }[color];
  const barCls = { rose: "bg-rose", amber: "bg-amber", leaf: "bg-leaf" }[color];
  return (
    <GlassCard className="px-3 py-3">
      <p className="text-[10px] text-rose-deep/50">{label}</p>
      <p className={cn("mt-0.5 text-2xl font-bold", textCls)}>{value}</p>
      <div className={cn("mt-1 h-0.5 w-6 rounded-full", barCls)} />
      <p className="mt-1 text-[9px] text-rose-deep/40">{sub}</p>
    </GlassCard>
  );
}
