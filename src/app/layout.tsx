import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { GradientBackground } from "@/components/theme/GradientBackground";
import { RegisterSW } from "@/components/pwa/RegisterSW";
import { ApiStatusBanner } from "@/components/ui/ApiStatusBanner";
import { BottomNav } from "@/components/nav/BottomNav";

// iOS「添加到主屏幕」原生启动图（apple-touch-startup-image），按机型匹配。
// 走 Next metadata 的 appleWebApp.startupImage——Next 16 文档保证输出带 media 的 <link>、
// mobile-web-app-capable、apple-mobile-web-app-title 与 status-bar-style，无需手写 <head>。
// 关键：每条都必须带 media——不要留「无 media 的兜底」，否则 iOS 会把它当全设备默认值，
// 尺寸不符时整体弃用、显白屏。
const STARTUP_IMAGES: { url: string; media: string }[] = [
  { url: "/startup/750x1334.png", media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" },
  { url: "/startup/1125x2436.png", media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" },
  { url: "/startup/1170x2532.png", media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" },
  { url: "/startup/1179x2556.png", media: "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)" },
  { url: "/startup/1206x2622.png", media: "(device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3)" },
  { url: "/startup/1242x2688.png", media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" },
  { url: "/startup/1284x2778.png", media: "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)" },
  { url: "/startup/1290x2796.png", media: "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)" },
  { url: "/startup/1320x2868.png", media: "(device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3)" },
];

export const metadata: Metadata = {
  title: "拾聚 · 家庭协作 · 全景日历",
  description: "极客家庭的私有化协作中枢与全景大事件轴",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon-192.png", apple: "/icon-192.png" },
  appleWebApp: {
    title: "拾聚",
    statusBarStyle: "black-translucent",
    startupImage: STARTUP_IMAGES,
  },
};

export const viewport: Viewport = {
  themeColor: "#ffcdd2",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full">
        <StoreProvider>
          <GradientBackground />
          <RegisterSW />
          <ApiStatusBanner />
          {children}
          <BottomNav />
        </StoreProvider>
      </body>
    </html>
  );
}
