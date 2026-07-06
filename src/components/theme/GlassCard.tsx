import { cn } from "@/lib/cn";

export function GlassCard({
  children,
  className,
  onClick,
  strong = false,
}: {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  strong?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        strong ? "glass-strong" : "glass",
        "rounded-3xl",
        onClick && "cursor-pointer active:scale-[0.99] transition-transform",
        className,
      )}
    >
      {children}
    </div>
  );
}
