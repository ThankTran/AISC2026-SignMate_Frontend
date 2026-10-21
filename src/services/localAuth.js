const key = "signmate:session";

export function getSession() {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;

    const session = JSON.parse(raw);
    if (!session?.token || session.token === "mock-jwt-token-demo") {
      sessionStorage.removeItem(key);
      return null;
    }

    return session;
  } catch {
    return null;
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
