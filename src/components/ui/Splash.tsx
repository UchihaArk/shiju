/** PWA 启动图：hydration / 路由判断期间全屏展示 launch.jpg。 */
export function Splash() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-[#ffe9d6] via-[#ffcdd2] to-[#ffab91]">
      <div className="relative mx-auto h-dvh w-full max-w-[430px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/launch.jpg"
          alt="拾聚 · 家庭协作 · 全景日历"
          className="h-full w-full object-cover"
          draggable={false}
        />
      </div>
    </div>
  );
}
