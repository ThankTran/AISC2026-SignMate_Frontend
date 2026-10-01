import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LoadingScreen from "../components/ui/LoadingScreen";
export default function PublicOnlyRoute({children}) { const {user,loading,registering}=useAuth();const location=useLocation();if(loading)return <LoadingScreen/>;if(user&&!registering)return <Navigate to={location.state?.from || '/dashboard'} replace/>;return children; }
