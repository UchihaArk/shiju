"use client";

import { useStore } from "@/lib/store";

/** 后端不可达时顶部提示条，帮助定位 NEXT_PUBLIC_API_URL 未配置等问题。 */
export function ApiStatusBanner() {
  const { hydrated, apiOnline } = useStore();
  if (!hydrated || apiOnline) return null;
  return (
    <div className="pointer-events-none fixed left-1/2 top-0 z-40 w-full max-w-[430px] -translate-x-1/2 px-4 pt-[calc(env(safe-area-inset-top)+6px)]">
      <div className="rounded-full bg-amber/95 px-3 py-1 text-center text-[11px] font-medium text-amber-deep shadow-md">
        ⚠️ 未连接后端 · 请检查 NEXT_PUBLIC_API_URL 是否指向 shiju-api
      </div>
    </div>
  );
}
