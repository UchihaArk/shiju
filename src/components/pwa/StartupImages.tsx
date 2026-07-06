// iOS PWA 原生启动图（apple-touch-startup-image），按机型匹配。由 launch.jpg 派生。
const IMAGES = [
  {
    href: "/startup/1290x2796.png",
    media:
      "screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
  },
  {
    href: "/startup/1179x2556.png",
    media:
      "screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
  },
  {
    href: "/startup/1284x2778.png",
    media:
      "screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
  },
  {
    href: "/startup/1170x2532.png",
    media:
      "screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
  },
  {
    href: "/startup/1242x2688.png",
    media:
      "screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
  },
  {
    href: "/startup/750x1334.png",
    media:
      "screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
  },
];

export function StartupImages() {
  return (
    <>
      {IMAGES.map((im) => (
        <link
          key={im.href}
          rel="apple-touch-startup-image"
          href={im.href}
          media={im.media}
        />
      ))}
    </>
  );
}
