const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? "";

const postJson = async (path, payload) => {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`${path} failed with HTTP ${res.status}`);
  }

  return res.json();
};

export const checkLessonAnswer = (payload) =>
  postJson("/api/lessons/check-answer", payload);

export const finishLesson = (payload) =>
  postJson("/api/lessons/finish", payload);