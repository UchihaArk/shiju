import { cn } from "@/lib/cn";

/** 全屏暖色渐变 + 漂浮色块。固定铺底，置于内容之下。 */
export function GradientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-16 -top-10 h-64 w-64 rounded-full bg-pink/40 blur-3xl animate-pulse-slow" />
      <div className="absolute right-[-60px] top-24 h-72 w-72 rounded-full bg-amber/40 blur-3xl animate-float-slow" />
      <div className="absolute bottom-[-40px] left-1/4 h-72 w-72 rounded-full bg-orange/35 blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/3 right-[-40px] h-56 w-56 rounded-full bg-rose/30 blur-3xl animate-float-slow" />
      <div className={cn("absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(255,255,255,0.35),rgba(255,255,255,0))]")} />
    </div>
  );
}
