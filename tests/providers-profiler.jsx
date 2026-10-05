import { Profiler } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../src/hooks/useAuth";
import { CurrentUserContext } from "../src/hooks/useCurrentUser";
import { ProgressProvider } from "../src/contexts/ProgressContext";
import { FriendsProvider } from "../src/contexts/FriendsContext";
import { ToastProvider } from "../src/components/ui/ToastProvider";
import { ConfirmProvider } from "../src/components/ui/ConfirmDialog";
import Sidebar from "../src/components/Sidebar/Sidebar";
import Header from "../src/components/Header/Header";
import FriendListPage from "../src/pages/Friends/FriendListPage";
import { socialApi } from "../src/services/api";
import { initialProgress } from "../src/utils/progress";
import "../src/index.css";

const user = {
  uid: "profiler-only",
  name: "Người học",
  email: "test@example.test",
  emailVerified: true,
};

socialApi.friends = async () => [];
socialApi.requests = async () => [];
socialApi.ping = async () => ({ updated: false });
socialApi.search = async () => [];

const counts = {};

function record(id) {
  counts[id] = (counts[id] || 0) + 1;
  document.getElementById("results").textContent = JSON.stringify(counts);
}

createRoot(document.getElementById("root")).render(
  <MemoryRouter initialEntries={["/friends/list"]}>
    <AuthContext.Provider value={{ user, logout: async () => {} }}>
      <CurrentUserContext.Provider value={user}>
        <ProgressProvider initialState={initialProgress()}>
          <FriendsProvider>
            <ToastProvider>
              <ConfirmProvider>
                <Profiler id="Sidebar" onRender={record}>
                  <Sidebar user={user} />
                </Profiler>
                <div style={{ marginLeft: 260 }}>
                  <Profiler id="Header" onRender={record}>
                    <Header />
                  </Profiler>
                  <Profiler id="Friends" onRender={record}>
                    <FriendListPage />
                  </Profiler>
                </div>
              </ConfirmProvider>
            </ToastProvider>
          </FriendsProvider>
        </ProgressProvider>
      </CurrentUserContext.Provider>
    </AuthContext.Provider>
  </MemoryRouter>,
);
