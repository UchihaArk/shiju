"use client";

import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

/** 轻量下拉刷新：包裹滚动区，scrollTop=0 时下拉超过阈值触发 onRefresh。 */
export function PullToRefresh({
  onRefresh,
  className,
  children,
}: {
  onRefresh: () => Promise<void>;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const startY = useRef<number | null>(null);
  const [pull, setPull] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const THRESHOLD = 56;

  function onTouchStart(e: React.TouchEvent) {
    if (ref.current && ref.current.scrollTop <= 0 && !refreshing) {
      startY.current = e.touches[0].clientY;
      setDragging(true);
    } else {
      startY.current = null;
    }
  }
  function onTouchMove(e: React.TouchEvent) {
    if (startY.current === null) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0) setPull(Math.min(dy * 0.45, 72));
  }
  async function onTouchEnd() {
    const met = pull >= THRESHOLD;
    startY.current = null;
    setDragging(false);
    if (met && !refreshing) {
      setRefreshing(true);
      setPull(THRESHOLD);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setPull(0);
      }
    } else {
      setPull(0);
    }
  }

  return (
    <div
      ref={ref}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className={cn("overscroll-contain", className)}
    >
      <div
        className="flex items-end justify-center overflow-hidden"
        style={{
          height: pull,
          opacity: pull / THRESHOLD,
          transition: dragging ? "none" : "height 200ms ease, opacity 200ms ease",
        }}
      >
        <Loader2 className={cn("mb-1 h-5 w-5 text-rose-deep/60", refreshing && "animate-spin")} />
      </div>
      {children}
    </div>
  );
}
