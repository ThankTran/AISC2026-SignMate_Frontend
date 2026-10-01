import { AuthContext } from '../hooks/useAuth';
import LoadingScreen from "../components/ui/LoadingScreen";
import { useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, signOut, reload } from "firebase/auth";
import { auth } from "../lib/firebase";
import {useNavigate} from 'react-router-dom';
import {useToast} from '../hooks/useToast';
import {onSessionExpired} from '../services/sessionExpiry';


export function AuthProvider({ children }) {
  const navigate=useNavigate(),toast=useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const [authRevision,setAuthRevision]=useState(0);
  const refreshUser=useCallback(async()=>{if(auth.currentUser){await reload(auth.currentUser);await auth.currentUser.getIdToken(true);setUser(auth.currentUser);setAuthRevision(value=>value+1);}},[]);
  const logout=useCallback(async ({expired=false}={})=>{
    setSigningOut(true);
    try {
      await signOut(auth);
      if(expired){setUser(null);setSigningOut(false);navigate('/login',{replace:true});toast({type:'info',message:'Phiên đăng nhập đã hết hạn'});return;}
      // Start a fresh public page after Firebase has cleared persisted auth.
      // Keep the guard paused until unload so it cannot redirect to /login.
      window.location.replace("/");
    } catch (error) {
      setSigningOut(false);
      throw error;
    }
  },[navigate,toast]);
  useEffect(()=>onSessionExpired(uid=>auth.currentUser?.uid===uid?logout({expired:true}):undefined),[logout]);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, authRevision, refreshUser, loading, signingOut, logout, registering, setRegistering }}>
      {loading ? <LoadingScreen /> : children}
    </AuthContext.Provider>
  );
}
