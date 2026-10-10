import { getSession, saveSession, clearSession } from "./localAuth";
import { errorMessage } from "./errorMessages";
import { createRequestPool } from "./requestPool";

const reads = createRequestPool();

export function api(path, options = {}) {
  const method = options.method || "GET";

  if (method !== "GET") {
    reads.clear();

    return request(path, options).finally(() => reads.clear());
  }

  if (options.signal) {
    return request(path, options);
  }

  const session = getSession();
  const key = JSON.stringify([options.publicRequest ? "public" : session?.token, path]);

  return reads.run(key, () => request(path, options, session));
}

if (import.meta.env.PROD && !import.meta.env.VITE_API_BASE_URL?.trim()) {
  throw new Error("Thiếu VITE_API_BASE_URL trong cấu hình production.");
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(
  /\/$/,
  "",
);

export class ApiError extends Error {
  constructor(status, message, code, details = {}) {
    super(errorMessage({ status, code, message }));
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
async function request(
  path,
  { method = "GET", body, signal, publicRequest = false } = {},
  session = getSession(),
) {
  if (!publicRequest && !session?.token) {
    throw new ApiError(401, "Vui lòng đăng nhập.", "UNAUTHORIZED");
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      signal: signal ?? AbortSignal.timeout(15000),
      headers: {
        ...(!publicRequest && session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }

    throw new ApiError(0, "Không kết nối được máy chủ.", "NETWORK_ERROR");
  }

  const data = response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    if (
      response.status === 401 &&
      !publicRequest &&
      data?.code !== "INVALID_CREDENTIALS" &&
      getSession()?.token === session?.token
    ) {
      clearSession();
    }

    throw new ApiError(
      response.status,
      data?.message || `API lỗi HTTP ${response.status}`,
      data?.code,
      { ...data, retryAfter: Number(response.headers.get("Retry-After")) },
    );
  }

  return data;
}

export const authApi = {
  register: (body) => api("/api/auth/register", { method: "POST", body, publicRequest: true }),
  login: async (body) => {
    const session = await api("/api/auth/login", { method: "POST", body, publicRequest: true });

    saveSession(session);

    return session;
  },
  logout: async () => {
    await api("/api/auth/logout", { method: "POST" });
    clearSession();
  },
  password: async (body) => {
    const session = await api("/api/auth/password", { method: "POST", body });

    saveSession(session);

    return session;
  },
  onboarding: () => api("/api/auth/onboarding", { method: "POST" }),
};

const post = (path, body) => api(path, { method: "POST", body });
const patch = (path, body) => api(path, { method: "PATCH", body });
const remove = (path) => api(path, { method: "DELETE" });

export const accountApi = {
  sync: (name) => post("/api/auth/sync", { name }),
  curriculumLevel: (level) => patch("/api/me/curriculum-level", { level }),
  deleteAccount: (password) => api("/api/me", { method: "DELETE", body: { password } }),
  me: () => api("/api/me"),
  update: (profile) => patch("/api/me", profile),
  stats: () => api("/api/me/stats"),
  dashboard: () => api("/api/dashboard"),
  leaderboard: (scope = "all") => api(`/api/leaderboard?scope=${encodeURIComponent(scope)}`),
};
export const learningApi = {
  path: () => api("/api/learning-path"),
  lesson: (id) => api(`/api/lessons/${id}`),
  theory: (id) => api(`/api/lessons/${id}/theory`),
  completeTheory: (id) => post(`/api/lessons/${id}/theory/complete`),
  quiz: (id) => api(`/api/chapters/${id}/quiz`),
  submitQuiz: (id, body) => post(`/api/chapters/${id}/quiz/submit`, body),
  quizResult: (id) => api(`/api/chapters/${id}/quiz/result`),
};
export const socialApi = {
  profile: (id) => api(`/api/users/${id}/profile`),
  block: (userId) => post("/api/blocks", { userId }),
  unblock: (id) => remove(`/api/blocks/${id}`),
  undoRejection: (id) => post(`/api/friends/requests/${id}/undo-rejection`),
  search: (q) => api(`/api/users/search?q=${encodeURIComponent(q)}`),
  friends: () => api("/api/friends"),
  requests: (direction = "incoming") =>
    api(`/api/friends/requests?direction=${encodeURIComponent(direction)}`),
  ping: () => post("/api/me/presence"),
  request: (userId) => post("/api/friends/requests", { userId }),
  decide: (id, action) => patch(`/api/friends/requests/${id}`, { action }),
  remove: (id) => remove(`/api/friends/${id}`),
  notifications: () => api("/api/notifications"),
  unreadCount: () => api("/api/notifications/unread-count"),
  readAll: () => patch("/api/notifications/read-all"),
  read: (id) => patch(`/api/notifications/${id}/read`),
};
export const callApi = {
  topics: () => api("/api/calls/topics"),
  history: () => api("/api/calls"),
  invitations: () => api("/api/calls?invitations=incoming"),
  invite: (partnerId, topic) => post("/api/calls", { partnerId, topic }),
  get: (id) => api(`/api/calls/${id}`),
  decide: (id, action) => patch(`/api/calls/${id}`, { action }),
  end: (id) => post(`/api/calls/${id}/end`),
  ping: (id) => post(`/api/calls/${id}/ping`),
  review: (id, body) => post(`/api/calls/${id}/reviews`, body),
  report: (id, reason) => post(`/api/calls/${id}/reports`, { reason }),
  match: (topics) => post("/api/matching", { topics }),
  cancelMatch: () => remove("/api/matching"),
  signal: (id, type, payload) => post(`/api/calls/${id}/signals`, { type, payload }),
  signals: (id, after = 0) => api(`/api/calls/${id}/signals?after=${after}`),
  chat: (id, text) => post(`/api/calls/${id}/messages`, { text }),
  messages: (id, after = 0) => api(`/api/calls/${id}/messages?after=${after}`),
};
export const practiceApi = {
  history: () => api("/api/practice/sessions"),
  start: (body) => post("/api/practice/sessions", body),
  finish: (id) => post(`/api/practice/sessions/${id}/finish`),
};
