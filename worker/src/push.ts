import webpush from "web-push";
import type { AppEnv } from "./types";

// 每次调用都重新设置 VAPID：setVapidDetails 很轻量，且避免 isolate 复用时
// 密钥被旧值缓存（曾因 initialized 标志导致换密钥后仍用旧私钥签名）。
export function initPush(env: AppEnv) {
  webpush.setVapidDetails(env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);
}

export interface PushSub {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

/** 发送一条推送。返回 false 表示该订阅已失效（404/410）需清理。 */
export async function sendPush(
  sub: PushSub,
  payload: Record<string, unknown>,
): Promise<boolean> {
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: sub.keys },
      JSON.stringify(payload),
    );
    return true;
  } catch (err: unknown) {
    const code = (err as { statusCode?: number })?.statusCode ?? 0;
    const body = (err as { body?: { toString(): string } })?.body?.toString().slice(0, 200) ?? "";
    if (code === 404 || code === 410) return false; // 失效订阅
    // 记下 push 服务返回的具体原因（如 VapidPkHashMismatch / BadJwtToken），便于排查
    console.error("[push] send error", code, body, (err as Error)?.message);
    return false;
  }
}
