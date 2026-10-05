import { useCurrentUser } from "../hooks/useCurrentUser";
import ErrorState from "../components/ui/ErrorState";
import LoadingScreen from "../components/ui/LoadingScreen";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ children, setup = false }) {
  const profile = useCurrentUser();
  const location = useLocation();
  const { user, loading, signingOut } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    // Logout can clear the user before navigation finishes. Let the provider
    // finish its Welcome redirect instead of racing it with a login redirect.
    if (signingOut) {
      return null;
    }

    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (profile._profileStatus === "loading") {
    return <LoadingScreen />;
  }

  if (profile._profileStatus === "error") {
    return <ErrorState error={profile._profileError} />;
  }

  if (!profile.hasSetLevel && location.pathname !== "/level") {
    return <Navigate to="/level" state={location.state || { from: location }} replace />;
  }

  if (!setup && !profile.onboardingComplete) {
    return <Navigate to="/onboarding" state={location.state || { from: location }} replace />;
  }

  return children;
}
