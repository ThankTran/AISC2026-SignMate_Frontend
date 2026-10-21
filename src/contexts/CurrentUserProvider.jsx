import { useCallback, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { currentUser as fallback } from "../mockdata/user/currentUser";
import { CurrentUserContext as Context } from "../hooks/useCurrentUser";
import { accountApi } from "../services/api";
import { useApiResource } from "../hooks/useApiResource";

const mock = import.meta.env.VITE_USE_MOCK === "true";
const empty = {};

function localOnboarding(uid) {
  try {
    return sessionStorage.getItem(`signmate:onboarding:${uid}`) === "true";
  } catch {
    return false;
  }
}

export function CurrentUserProvider({ children }) {
  const { user, authRevision } = useAuth();
  const [flags, setFlags] = useState(null),
    [saved, setSaved] = useState(null);
  const uid = user?.uid;
  const loader = useCallback(() => (uid && !mock ? accountApi.me() : Promise.resolve({})), [uid]);
  const { data: remote, error } = useApiResource(loader, authRevision);
  const ui = flags && flags.uid === uid ? flags.data : empty;
  const data = saved && saved.uid === uid ? saved.data : remote || empty;
  const updateCurrent = useCallback((data) => setSaved({ uid, data }), [uid]);
  const completeOnboarding = useCallback(() => {
    try {
      sessionStorage.setItem(`signmate:onboarding:${uid}`, "true");
    } catch {
      /* Session-only fallback remains available. */
    }

    setFlags({ uid, data: { onboardingComplete: true } });
  }, [uid]);
  const displayName =
    data.name ||
    user?.displayName ||
    user?.email?.split("@")[0] ||
    (mock ? fallback.name : "Người học");
  const profileStatus =
    !uid || remote || (saved && saved.uid === uid) ? "ready" : error ? "error" : "loading";
  const current = useMemo(
    () => ({
      ...(mock ? fallback : {}),
      ...data,
      uid,
      displayName,
      name: displayName,
      email: user?.email || data.email || "",
      photoURL: user?.photoURL || "",
      handle: `@${(user?.email || displayName).split("@")[0]}`,
      onboardingComplete:
        mock || data.onboardingComplete === true || ui.onboardingComplete === true || localOnboarding(uid),
      hasSetLevel: mock || data.hasSetLevel === true,
      _profileStatus: profileStatus,
      _profileError: error,
      _updateProfile: updateCurrent,
      _completeOnboarding: completeOnboarding,
    }),
    [
      data,
      uid,
      displayName,
      user?.email,
      user?.photoURL,
      ui.onboardingComplete,
      profileStatus,
      error,
      updateCurrent,
      completeOnboarding,
    ],
  );

  return <Context.Provider value={current}>{children}</Context.Provider>;
}
