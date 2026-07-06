"use client";

import { api } from "./api";
import { getUid } from "./identity";

const PUSH_FLAG = "shiju.push";

export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

export function pushEnabled(): boolean {
  return typeof window !== "undefined" && localStorage.getItem(PUSH_FLAG) === "1";
}

function base64urlToUint8Array(b64url: string): Uint8Array {
  const padded = b64url + "=".repeat((4 - (b64url.length % 4)) % 4);
  const binary = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function fetchVapidKey(): Promise<string> {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";
  const r = await fetch(`${base}/api/vapid-public`);
  return ((await r.json()) as { key: string }).key;
}

/** 开启提醒：授权 → 订阅 → 上报 → 发测试通知。 */
export async function subscribePush(): Promise<boolean> {
  if (!pushSupported() || !getUid()) return false;
  const perm = await Notification.requestPermission();
  if (perm !== "granted") return false;
  await navigator.serviceWorker.register("/sw.js");
  const reg = await navigator.serviceWorker.ready;
  const vapid = await fetchVapidKey();
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: base64urlToUint8Array(vapid) as BufferSource,
  });
  const j = sub.toJSON();
  await api.registerSubscription({
    endpoint: j.endpoint!,
    keys: j.keys as { p256dh: string; auth: string },
  });
  localStorage.setItem(PUSH_FLAG, "1");
  // 立即发一条测试，确认链路通畅
  await api.testPush();
  return true;
}

/** 关闭提醒。 */
export async function unsubscribePush(): Promise<boolean> {
  if (!pushSupported()) return false;
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  if (sub?.endpoint) {
    await api.unregisterSubscription(sub.endpoint);
    await sub.unsubscribe();
  }
  localStorage.removeItem(PUSH_FLAG);
  return true;
}
