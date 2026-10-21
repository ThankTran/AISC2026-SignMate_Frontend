const key = "signmate:session";

const defaultMockSession = {
  token: "mock-jwt-token-demo",
  user: {
    uid: "user_1",
    email: "learner@signmate.vn",
    displayName: "Minh Anh",
  },
};

export function getSession() {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return defaultMockSession;
    return JSON.parse(raw);
  } catch {
    return defaultMockSession;
  }
}

export function saveSession(session) {
  if (session) {
    sessionStorage.setItem(key, JSON.stringify(session));
  } else {
    sessionStorage.removeItem(key);
  }

  window.dispatchEvent(new Event("signmate:auth-changed"));
}

export function clearSession() {
  saveSession(null);
}
