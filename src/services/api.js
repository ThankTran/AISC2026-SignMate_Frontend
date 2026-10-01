import { auth } from "../lib/firebase";
import {errorMessage} from './errorMessages';
import {notifySessionExpired,withTokenRetry} from './sessionExpiry';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/$/, "");
export class ApiError extends Error {
  constructor(status, message, code) { super(errorMessage({status,code,message})); this.name="ApiError"; this.status=status; this.code=code; this.rawMessage=message; }
}
export async function api(path, { method = "GET", body, signal } = {}) {
  await auth.authStateReady();
  const user = auth.currentUser;
  if (!user) throw new ApiError(401, "Vui lòng đăng nhập để tiếp tục.","UNAUTHORIZED");
  const send = async (forceRefresh) => {
    let token;
    try{token=await user.getIdToken(forceRefresh);}catch(error){
      if(['auth/user-token-expired','auth/invalid-user-token','auth/user-disabled'].includes(error.code)){
        if(auth.currentUser?.uid===user.uid)await notifySessionExpired(user.uid);
        throw new ApiError(401,error.message,'UNAUTHORIZED');
      }
      throw new ApiError(0,error.message,'NETWORK_ERROR');
    }
    try {
      return await fetch(`${API_BASE_URL}${path}`, {
    method, signal: signal ?? AbortSignal.timeout(15000),
    headers: { Authorization: `Bearer ${token}`,
      ...(body === undefined ? {} : { "Content-Type": "application/json" }) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
    } catch (error) {
      if (error.name === "AbortError") throw error;
      if (error.name === "TimeoutError") {
        throw new ApiError(0, "Máy chủ phản hồi quá lâu. Vui lòng thử lại.","TIMEOUT");
      }
      throw new ApiError(0, "Không kết nối được máy chủ.","NETWORK_ERROR");
    }
  };
  const response = await withTokenRetry(send,async()=>{if(auth.currentUser?.uid===user.uid)await notifySessionExpired(user.uid);});
  if (response.status === 204) return null;
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(response.status, data?.message || `API lỗi HTTP ${response.status}`,data?.code);
  return data;
}
const post = (path, body) => api(path, { method: "POST", body });
const patch = (path, body) => api(path, { method: "PATCH", body });
const remove = (path) => api(path, { method: "DELETE" });
export const accountApi = {
  sync: (name) => post('/api/auth/sync', {name}),
  curriculumLevel: (level) => patch('/api/me/curriculum-level', {level}),
  deleteAccount: () => remove('/api/me'),
  me: () => api("/api/me"),
  update: (profile) => patch("/api/me", profile),
  stats: () => api("/api/me/stats"),
  dashboard: () => api("/api/dashboard"),
  leaderboard: (scope = "all") => api(`/api/leaderboard?scope=${encodeURIComponent(scope)}`),
};
export const learningApi = {
  path: () => api("/api/learning-path"),
  lesson: (id) => api(`/api/lessons/${id}`),
  quiz: (id) => api(`/api/chapters/${id}/quiz`),
  checkQuiz: (id, body) => post(`/api/chapters/${id}/quiz/check-answer`, body),
  submitQuiz: (id, body) => post(`/api/chapters/${id}/quiz/submit`, body),
  quizResult: (id) => api(`/api/chapters/${id}/quiz/result`),
};
export const socialApi = {
  search: (q) => api(`/api/users/search?q=${encodeURIComponent(q)}`),
  friends: () => api("/api/friends"), requests: (direction='incoming') => api(`/api/friends/requests?direction=${encodeURIComponent(direction)}`),
  ping: () => post('/api/me/presence'),
  request: (userId) => post("/api/friends/requests", { userId }),
  decide: (id, action) => patch(`/api/friends/requests/${id}`, { action }),
  remove: (id) => remove(`/api/friends/${id}`),
  notifications: () => api("/api/notifications"),
  unreadCount: () => api('/api/notifications/unread-count'),
  readAll: () => patch('/api/notifications/read-all'),
  read: (id) => patch(`/api/notifications/${id}/read`),
};
export const callApi = {
  topics: () => api("/api/calls/topics"), history: () => api("/api/calls"),
  invitations: () => api("/api/calls?invitations=true"),
  invite: (partnerId, topic) => post("/api/calls", { partnerId, topic }),
  get: (id) => api(`/api/calls/${id}`),
  decide: (id, action) => patch(`/api/calls/${id}`, { action }),
  end: (id) => post(`/api/calls/${id}/end`),
  review: (id, body) => post(`/api/calls/${id}/reviews`, body),
  report: (id, reason) => post(`/api/calls/${id}/reports`, { reason }),
  match: (topic) => post("/api/matching", { topic }),
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
