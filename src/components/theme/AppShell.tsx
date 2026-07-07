"use client";

/** 统一的标签页外壳：h-dvh + 内部滚动，body 永不滚动，
 *  避免切页时 iOS PWA standalone 重新布局导致底部导航跳位。 */
export function AppShell({
  top,
  children,
}: {
  top?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex h-dvh w-full max-w-[430px] flex-col px-4 pt-[calc(env(safe-area-inset-top)+14px)]">
      {top ? <div className="shrink-0">{top}</div> : null}
      <div className="no-scrollbar mt-3 flex-1 overflow-y-auto pb-28 overscroll-contain">
        {children}
      </div>
    </div>
  );
}
