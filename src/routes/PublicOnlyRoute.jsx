import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LoadingScreen from "../components/ui/LoadingScreen";
import {useCurrentUser} from '../hooks/useCurrentUser';
export default function PublicOnlyRoute({children}) {
 const {user,loading,registering}=useAuth(),profile=useCurrentUser(),location=useLocation();
 if(loading)return <LoadingScreen/>;
 // A restored, unfinished session must not make the login/register step disappear.
 if(user&&!registering&&profile?._profileStatus==='loading')return <LoadingScreen/>;
 if(user&&!registering&&profile?.hasSetLevel&&profile?.onboardingComplete)
  return <Navigate to={location.state?.from || '/dashboard'} replace/>;
 return children;
}
