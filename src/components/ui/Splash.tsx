import { GlassCard } from "@/components/theme/GlassCard";

/** 暖色启动占位（hydration / 路由判断期间）。 */
export function Splash() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-6">
      <GlassCard strong className="flex flex-col items-center gap-4 px-10 py-12">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-rose/30" />
          <div className="relative grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-rose to-orange text-3xl font-bold text-white shadow-lg">
            拾
          </div>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-rose-deep">拾聚</p>
          <p className="text-xs text-rose-deep/60">家庭协作 · 全景日历</p>
        </div>
      </GlassCard>
    </div>
  );
}
