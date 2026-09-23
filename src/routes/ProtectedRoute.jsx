import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading, signingOut } = useAuth();

  if (loading) return null;

  if (!user) {
    // Firebase can clear the user before signOut resolves. Let the provider
    // finish its Welcome redirect instead of racing it with a login redirect.
    if (signingOut) return null;
    return <Navigate to="/login" replace />;
  }

  return children;
}
