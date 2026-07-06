"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ListTodo, CalendarDays, Archive, BarChart3 } from "lucide-react";
import { cn } from "@/lib/cn";

const TABS = [
  { key: "home", label: "事项", icon: ListTodo, href: "/home" },
  { key: "calendar", label: "日历", icon: CalendarDays, href: "/calendar" },
  { key: "archive", label: "归档", icon: Archive, href: "/archive" },
  { key: "report", label: "报告", icon: BarChart3, href: "/report" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2 px-4 pb-[max(env(safe-area-inset-bottom),10px)]">
      <div className="glass flex items-stretch justify-around rounded-3xl px-2 py-1.5">
        {TABS.map((t) => {
          const active = pathname === t.href;
          const Icon = t.icon;
          return (
            <Link
              key={t.key}
              href={t.href}
              prefetch
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1.5 transition active:scale-95",
                active ? "text-rose-deep" : "text-rose-deep/45",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{t.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
