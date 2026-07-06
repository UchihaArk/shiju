"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { PhoneFrame } from "@/components/theme/PhoneFrame";
import { GlassCard } from "@/components/theme/GlassCard";
import { EventForm } from "@/components/event/EventForm";
import { useStore } from "@/lib/store";
import { Splash } from "@/components/ui/Splash";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { hydrated, member, events } = useStore();

  useEffect(() => {
    if (hydrated && !member) router.replace("/login");
  }, [hydrated, member, router]);

  if (!hydrated || !member) return <Splash />;

  const event = events.find((e) => e.id === params.id);

  const header = (
    <div className="mb-3 flex items-center gap-2">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="返回"
        className="grid h-9 w-9 place-items-center rounded-full bg-white/40 text-rose-deep backdrop-blur-sm active:scale-95"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <h1 className="text-lg font-bold text-rose-deep">编辑事项</h1>
    </div>
  );

  if (!event) {
    return (
      <PhoneFrame className="pt-[calc(env(safe-area-inset-top)+14px)]">
        {header}
        <GlassCard className="px-6 py-10 text-center text-sm text-rose-deep/60">
          事项不存在
        </GlassCard>
      </PhoneFrame>
    );
  }

  if (event.createdBy !== member.id) {
    return (
      <PhoneFrame className="pt-[calc(env(safe-area-inset-top)+14px)]">
        {header}
        <GlassCard className="px-6 py-10 text-center text-sm text-rose-deep/60">
          只有发布者可以编辑该事项
        </GlassCard>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame className="pt-[calc(env(safe-area-inset-top)+14px)]">
      {header}
      <EventForm event={event} onDone={() => router.back()} />
    </PhoneFrame>
  );
}
