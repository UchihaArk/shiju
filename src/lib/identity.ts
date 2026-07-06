/** 座位牌免密身份：仅存当前成员 id（uid）到 LocalStorage。 */

const UID_KEY = "shiju.uid";

export function getUid(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(UID_KEY);
  } catch {
    return null;
  }
}

export function setUid(uid: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (uid) window.localStorage.setItem(UID_KEY, uid);
    else window.localStorage.removeItem(UID_KEY);
  } catch {
    /* ignore */
  }
}

export function clearAll() {
  setUid(null);
}
