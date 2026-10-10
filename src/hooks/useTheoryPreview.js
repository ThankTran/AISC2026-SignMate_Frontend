import { useSyncExternalStore } from "react";
import { useCurrentUser } from "./useCurrentUser";
import { useProgress } from "./useProgress";
import { learningApi } from "../services/api";
import { readTheoryItems, markTheoryItem } from "../utils/theoryProgress.js";

// Server completion survives browser sessions; local state bridges the refresh after saving.
const listeners = new Set();
const memory = new Map();
const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
export function useTheoryPreview() {
  const user = useCurrentUser();
  const { chapters, source, recordTheory } = useProgress();
  const key = `signmate:theory-preview:v3:${user?.uid || "guest"}`;
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
    isDone: (id) =>
      ids.includes(String(id)) ||
      (chapters || []).some((chapter) =>
        chapter.lessons.some(
          (lesson) => String(lesson.id) === String(id) && lesson.theoryCompleted,
        ),
      ),
    complete: async (id) => {
      if (source === "server") await learningApi.completeTheory(id);
      const next = JSON.stringify([...new Set([...ids, String(id)])]);
      memory.set(key, next);
      try {
        sessionStorage.setItem(key, next);
      } catch {
        /* In-memory fallback. */
      }
      listeners.forEach((listener) => listener());
      recordTheory?.(id);
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
  const ids = readTheoryItems(raw, items, completed);
  function mark(id) {
    // Read at event time: video completion and manual clicks may share an old render.
    const next = markTheoryItem(snapshot(), items, completed, id);
    memory.set(key, next);
    try {
      sessionStorage.setItem(key, next);
    } catch {
      /* In-memory fallback. */
    }
    listeners.forEach((listener) => listener());
  }
  return { ids, mark };
}
