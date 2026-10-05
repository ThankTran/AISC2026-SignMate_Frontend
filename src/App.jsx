import PageMetadata from "./components/PageMetadata";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import { ProgressProvider } from "./contexts/ProgressContext";
import { FriendsProvider } from "./contexts/FriendsContext";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import AppRoutes from "./routes/AppRoutes";
import ScrollToTop from "./components/ScrollToTop";

import { ToastProvider } from "./components/ui/ToastProvider";
import { ConfirmProvider } from "./components/ui/ConfirmDialog";
import { CurrentUserProvider } from "./contexts/CurrentUserProvider";
function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <CurrentUserProvider>
              <ProgressProvider>
                <FriendsProvider>
                  <ConfirmProvider>
                    <ScrollToTop />
                    <PageMetadata />
                    <AppRoutes />
                  </ConfirmProvider>
                </FriendsProvider>
              </ProgressProvider>
            </CurrentUserProvider>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
