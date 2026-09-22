import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user && user.emailVerified) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}