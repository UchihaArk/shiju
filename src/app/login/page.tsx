"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SeatGrid } from "@/components/identity/SeatGrid";
import { PhoneFrame } from "@/components/theme/PhoneFrame";
import { GlassCard } from "@/components/theme/GlassCard";
import { useStore } from "@/lib/store";
import { Splash } from "@/components/ui/Splash";

export default function LoginPage() {
  const router = useRouter();
  const { hydrated, member, members, pickMember } = useStore();

  // 已登录直接进首页
  useEffect(() => {
    if (hydrated && member) router.replace("/home");
  }, [hydrated, member, router]);

  function handlePick(m: (typeof members)[number]) {
    pickMember(m);
    router.replace("/home");
  }

  if (!hydrated) return <Splash />;

  return (
    <PhoneFrame className="pt-[calc(env(safe-area-inset-top)+18px)]">
      <div className="mb-5 overflow-hidden rounded-3xl border border-white/50 shadow-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/launch.jpg"
          alt="拾聚 · 家庭协作 · 全景日历"
          className="block w-full"
        />
      </div>

      <GlassCard className="px-5 py-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-lg">🏠</span>
          <h2 className="text-base font-semibold text-rose-deep">
            请选择你的家庭身份
          </h2>
        </div>
        <SeatGrid members={members} onPick={handlePick} />
        <p className="mt-5 text-center text-[11px] leading-relaxed text-rose-deep/45">
          免密登录 · 身份仅记录在本机
          <br />
          点击你的头像即可进入家庭大盘
        </p>
      </GlassCard>
    </PhoneFrame>
  );
}
