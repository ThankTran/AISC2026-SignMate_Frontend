import { useSyncExternalStore } from "react";
import { useCurrentUser } from "./useCurrentUser";

// UI prototype only: scoped to the account and current browser tab, never server XP.
const listeners = new Set();
const memory = new Map();
const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
export function useTheoryPreview() {
  const user = useCurrentUser();
  const key = `signmate:theory-preview:${user?.uid || "guest"}`;
  const snapshot = () => {
    try {
      return sessionStorage.getItem(key) || memory.get(key) || "[]";
    } catch {
      return memory.get(key) || "[]";
    }
  };
  const raw = useSyncExternalStore(subscribe, snapshot, () => "[]");
  let ids;
  try {
    ids = JSON.parse(raw);
  } catch {
    ids = [];
  }
  if (!Array.isArray(ids)) ids = [];
  return {
    isDone: (id) => ids.includes(String(id)),
    complete: (id) => {
      const next = JSON.stringify([...new Set([...ids, String(id)])]);
      memory.set(key, next);
      try {
        sessionStorage.setItem(key, next);
      } catch {
        /* In-memory fallback. */
      }
      listeners.forEach((listener) => listener());
    },
  };
}
