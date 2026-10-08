import { useSyncExternalStore } from "react";
import { useCurrentUser } from "./useCurrentUser";

// Theory progress is scoped to the account and browser tab, separate from server XP.
const listeners = new Set();
const memory = new Map();
const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
export function useTheoryPreview() {
  const user = useCurrentUser();
  const key = `signmate:theory-preview:v2:${user?.uid || "guest"}`;
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

export function useTheoryItems(lessonId, items, completed) {
  const user = useCurrentUser();
  const key = `signmate:theory-items:v2:${user?.uid || "guest"}:${lessonId}`;
  const snapshot = () => {
    try {
      return sessionStorage.getItem(key) || memory.get(key) || "";
    } catch {
      return memory.get(key) || "";
    }
  };
  const raw = useSyncExternalStore(subscribe, snapshot, () => "");
  let stored;
  try {
    stored = JSON.parse(raw);
  } catch {
    stored = [];
  }
  const validIds = new Set(items.map((item) => item.id));
  const ids =
    !raw && completed
      ? [...validIds]
      : Array.isArray(stored)
        ? [...new Set(stored.filter((id) => validIds.has(id)))]
        : [];
  function update(id, toggle = false) {
    if (!validIds.has(id)) return;
    const next = JSON.stringify(
      toggle && ids.includes(id) ? ids.filter((value) => value !== id) : [...new Set([...ids, id])],
    );
    memory.set(key, next);
    try {
      sessionStorage.setItem(key, next);
    } catch {
      /* In-memory fallback. */
    }
    listeners.forEach((listener) => listener());
  }
  return { ids, mark: (id) => update(id), toggle: (id) => update(id, true) };
}
