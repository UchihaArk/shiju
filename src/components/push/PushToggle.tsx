"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { pushEnabled, pushSupported, subscribePush, unsubscribePush } from "@/lib/push";

export function PushToggle({ className }: { className?: string }) {
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(pushSupported());
    setEnabled(pushEnabled());
  }, []);

  if (!supported) return null;

  async function toggle() {
    if (busy) return;
    setBusy(true);
    try {
      if (enabled) {
        await unsubscribePush();
        setEnabled(false);
      } else {
        const ok = await subscribePush();
        setEnabled(ok);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={enabled ? "关闭提醒" : "开启提醒"}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-full backdrop-blur-sm active:scale-95",
        enabled
          ? "bg-gradient-to-br from-rose to-orange text-white shadow"
          : "bg-white/40 text-rose-deep",
        className,
      )}
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : enabled ? (
        <Bell className="h-4 w-4" />
      ) : (
        <BellOff className="h-4 w-4" />
      )}
    </button>
  );
}
