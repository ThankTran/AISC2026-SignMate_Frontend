import { api } from "./api";

export const checkLessonAnswer = (body) =>
  api("/api/lessons/check-answer", { method: "POST", body });
export const finishLesson = (body) => api("/api/lessons/finish", { method: "POST", body });
