import { Loader2 } from "lucide-react";

/** hydration / 路由判断期间的极简占位（暖底 + 小转圈）。
 *  原生启动图由 manifest + apple-touch-startup-image 负责，不在这里展示。 */
export function Splash() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#ffcdd2]">
      <Loader2 className="h-7 w-7 animate-spin text-rose-deep/50" />
    </div>
  );
}
