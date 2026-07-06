import webpush from "web-push";
import type { AppEnv } from "./types";

let initialized = false;

export function initPush(env: AppEnv) {
  if (initialized) return;
  webpush.setVapidDetails(env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);
  initialized = true;
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
    if (code === 404 || code === 410) return false; // 失效订阅
    console.error("[push] send error", code, (err as Error)?.message);
    return false;
  }
}
