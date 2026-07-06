"use client";

import { useEffect } from "react";

/** 应用启动时注册 Service Worker（PWA 安装 + Web Push 必需）。 */
export function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((e) => {
        console.warn("SW 注册失败", e);
      });
    }
  }, []);
  return null;
}
