import { cn } from "@/lib/cn";

/** 移动优先；桌面端居中 ≤430px 手机框，两侧露出渐变。 */
export function PhoneFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[430px] px-4 pb-10", className)}>
      {children}
    </div>
  );
}
