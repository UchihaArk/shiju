"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { PhoneFrame } from "@/components/theme/PhoneFrame";
import { EventForm } from "@/components/event/EventForm";
import { useStore } from "@/lib/store";
import { Splash } from "@/components/ui/Splash";

export default function NewEventPage() {
  return (
    <Suspense fallback={<Splash />}>
      <NewEventInner />
    </Suspense>
  );
}

function NewEventInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hydrated, member } = useStore();
  const initialDate = searchParams.get("date");

  useEffect(() => {
    if (hydrated && !member) router.replace("/login");
  }, [hydrated, member, router]);

  if (!hydrated || !member) return <Splash />;

  return (
    <PhoneFrame className="pt-[calc(env(safe-area-inset-top)+14px)]">
      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="返回"
          className="grid h-9 w-9 place-items-center rounded-full bg-white/40 text-rose-deep backdrop-blur-sm active:scale-95"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-rose-deep">新建事项</h1>
        {initialDate && (
          <span className="ml-auto text-xs text-rose-deep/50">
            已选中 {initialDate.slice(5).replace("-", "/")}
          </span>
        )}
      </div>

      <EventForm
        initialDate={initialDate}
        onDone={() => router.replace("/home")}
      />
    </PhoneFrame>
  );
}
