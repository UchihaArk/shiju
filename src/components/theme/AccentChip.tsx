import { cn } from "@/lib/cn";
import { ACCENT } from "@/lib/colors";
import type { AccentColor } from "@/types";

export function AccentChip({
  color,
  children,
  className,
}: {
  color: AccentColor;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium leading-none",
        ACCENT[color].chip,
        className,
      )}
    >
      {children}
    </span>
  );
}
