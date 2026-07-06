import type { AccentColor } from "@/types";

/** 事件类型 → 标签 / 配色 / 图标。type key 存入 events.color 列（复用，免迁移）。 */
export const EVENT_TYPES = {
  regular: { label: "普通", color: "leaf", emoji: "📌" },
  dining: { label: "聚餐", color: "amber", emoji: "🍽️" },
  childcare: { label: "育儿", color: "pink", emoji: "🍼" },
  pet: { label: "宠物", color: "tan", emoji: "🐾" },
  trip: { label: "出行", color: "orange", emoji: "🚗" },
  leisure: { label: "休闲", color: "leaf", emoji: "☕" },
  festival: { label: "节日", color: "rose", emoji: "🎉" },
  medical: { label: "看病", color: "orange", emoji: "💊" },
  urgent: { label: "紧急", color: "rose", emoji: "⚠️" },
} as const;

export type EventTypeKey = keyof typeof EVENT_TYPES;

export interface EventTypeMeta {
  label: string;
  color: AccentColor;
  emoji: string;
}

/** 由 events.color 列的值（类型 key 或旧颜色）解析出展示信息。 */
export function eventTypeMeta(key: string): EventTypeMeta {
  const found = EVENT_TYPES[key as EventTypeKey];
  if (found) return { label: found.label, color: found.color as AccentColor, emoji: found.emoji };
  // 兼容旧数据（直接存的 AccentColor）：按普通事件处理，沿用其色
  return { label: "普通", color: (key as AccentColor) || "leaf", emoji: "📌" };
}

/** 是否为"非普通"的已知类型（用于决定是否显示类型徽标）。 */
export function hasTypeBadge(key: string): boolean {
  return key in EVENT_TYPES && key !== "regular";
}
