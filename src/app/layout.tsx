import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { GradientBackground } from "@/components/theme/GradientBackground";
import { RegisterSW } from "@/components/pwa/RegisterSW";

export const metadata: Metadata = {
  title: "拾聚 · 家庭协作 · 全景日历",
  description: "极客家庭的私有化协作中枢与全景大事件轴",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "拾聚", statusBarStyle: "black-translucent" },
  icons: { icon: "/icon-192.png", apple: "/icon-192.png" },
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
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
