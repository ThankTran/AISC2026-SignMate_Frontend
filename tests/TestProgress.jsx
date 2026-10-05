import { CurrentUserContext } from "../src/hooks/useCurrentUser";
import { ProgressProvider } from "../src/contexts/ProgressContext";
import { initialProgress } from "../src/utils/progress";

const user = {
  uid: "ui-test-only",
  name: "Minh Anh",
  displayName: "Minh Anh",
  email: "test@example.test",
  _profileStatus: "ready",
};
const state = initialProgress();

export default function TestProgress({ children }) {
  return (
    <CurrentUserContext.Provider value={user}>
      <ProgressProvider initialState={state}>{children}</ProgressProvider>
    </CurrentUserContext.Provider>
  );
}
