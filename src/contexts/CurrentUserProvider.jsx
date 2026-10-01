import { useCallback, useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { currentUser as fallback } from '../mockdata/user/currentUser';
import { CurrentUserContext as Context } from '../hooks/useCurrentUser';
import { accountApi } from '../services/api';
import { useApiResource } from '../hooks/useApiResource';
const mock=import.meta.env.VITE_USE_MOCK==='true';
function localOnboarding(uid) {
  try { return sessionStorage.getItem(`signmate:onboarding:${uid}`)==='true'; } catch { return false; }
}
export function CurrentUserProvider({ children }) {
  const {user}=useAuth();
  const [flags,setFlags]=useState(null),[saved,setSaved]=useState(null);
  const uid=user?.uid;
  const loader=useCallback(()=>uid&&!mock?accountApi.me():Promise.resolve({}),[uid]);
  const {data:remote,error}=useApiResource(loader);
  useEffect(()=>{
    if(!uid)return;
    return onSnapshot(doc(db,'users',uid),snapshot=>setFlags({uid,data:snapshot.data()||{}}),()=>setFlags({uid,data:{}}));
  },[uid]);
  const ui=flags?.uid===uid?flags.data:{};
  const data=saved?.uid===uid?saved.data:remote||{};
  const updateCurrent=useCallback(data=>setSaved({uid,data}),[uid]);
  const completeOnboarding=useCallback(()=>{
    try { sessionStorage.setItem(`signmate:onboarding:${uid}`,'true'); } catch { /* Session-only fallback remains available. */ }
    setFlags({uid,data:{onboardingComplete:true}});
  },[uid]);
  const displayName=data.name||user?.displayName||user?.email?.split('@')[0]||(mock?fallback.name:'Người học');
  const current={...(mock?fallback:{}),...data,uid,displayName,name:displayName,
    email:user?.email||data.email||'',photoURL:user?.photoURL||'',handle:`@${(user?.email||displayName).split('@')[0]}`,
    onboardingComplete:ui.onboardingComplete===true||localOnboarding(uid),
    hasSetLevel:data.hasSetLevel===true,
    _profileStatus:!uid||remote||saved?.uid===uid?'ready':error?'error':'loading',
    _profileError:error,_updateProfile:updateCurrent,_completeOnboarding:completeOnboarding};
  return <Context.Provider value={current}>{children}</Context.Provider>;
}
