import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";
import { db } from "../lib/firebase";
import { currentUser as fallback } from "../mockdata/user/currentUser";
import { CurrentUserContext as Context } from "../hooks/useCurrentUser";
export function CurrentUserProvider({ children }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    if (!user?.uid) return;
    return onSnapshot(doc(db, 'users', user.uid), snapshot => setProfile({ uid: user.uid, data: snapshot.exists() ? snapshot.data() : {} }), error => setProfile({ uid: user.uid, data: {}, error }));
  }, [user?.uid]);
  const data = profile?.uid === user?.uid ? profile?.data || {} : {};
  const displayName = data.displayName || data.name || user?.displayName || user?.email?.split('@')[0] || fallback.name;
  const current = { _profileStatus: !user || profile?.uid === user.uid ? (profile?.error ? "error" : "ready") : "loading", _profileError: profile?.error, ...fallback, ...data, uid: user?.uid, displayName, name: displayName, email: data.email || user?.email || '', photoURL: data.photoURL || user?.photoURL || '', handle: `@${(data.email || user?.email || displayName).split('@')[0]}` };
  return <Context.Provider value={current}>{children}</Context.Provider>;
}
