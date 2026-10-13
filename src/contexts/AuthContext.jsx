import { AuthContext } from "../hooks/useAuth";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getSession, saveSession, clearSession } from "../services/localAuth";
import { authApi, accountApi } from "../services/api";
export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getSession()?.user || null),
    [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false),
    [signingOut, setSigningOut] = useState(false),
    [authRevision, setAuthRevision] = useState(0);
  const refreshUser = useCallback(async () => {
    const session = getSession();

    if (!session) {
      return;
    }

    const profile = await accountApi.me();

    if (getSession()?.token !== session.token) {
      return;
    }

    saveSession({
      ...session,
      user: { uid: profile.id, email: profile.email, displayName: profile.name },
    });
  }, []);

  useEffect(() => {
    const update = () => {
      const nextUser = getSession()?.user || null;
      setUser(nextUser);
      if (nextUser) setSigningOut(false);
      setAuthRevision((n) => n + 1);
    };

    window.addEventListener("signmate:auth-changed", update);
    refreshUser()
      .catch(() => {})
      .finally(() => setLoading(false));

    return () => window.removeEventListener("signmate:auth-changed", update);
  }, [refreshUser]);

  const logout = useCallback(async () => {
    setSigningOut(true);

    try {
      await authApi.logout();
      clearSession();
      navigate("/", { replace: true });
    } catch (error) {
      setSigningOut(false);
      throw error;
    }
  }, [navigate]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        registering,
        setRegistering,
        signingOut,
        logout,
        refreshUser,
        authRevision,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
