import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import AppRoutes from "./routes/AppRoutes";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import MainLayout from "./layouts/MainLayout/MainLayout";

import ScrollToTop from "./components/ScrollToTop";

import LearningPathPage from "./pages/LearningPathPage/LearningPathPage";
import LessonPage from "./pages/LessonPage/LessonPage";
import QuizPage from "./pages/QuizPage/QuizPage";
import QuizRouteGuard from "./pages/QuizPage/QuizRouteGuard";
import QuizResultPage from "./pages/QuizResultPage/QuizResultPage";
import AiPracticePage from "./pages/AiPracticePage/AiPracticePage";
import FriendsPage from "./pages/Friends/FriendsPage";
import LeaderboardPage from "./pages/LeaderboardPage/LeaderboardPage";
import Dashboard from "./pages/Dashboard/Dashboard";
import Profile from "./pages/Profile/Profile";
import Stats from "./pages/Stats/Stats";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
      <ScrollToTop />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/learning-path" element={<LearningPathPage />} />
          <Route path="/learning-path/lesson/:lessonId" element={<LessonPage />} />
          <Route
            path="/learning-path/quiz/:quizId"
            element={
              <QuizRouteGuard>
                <QuizPage />
              </QuizRouteGuard>
            }
          />
          <Route
            path="/learning-path/quiz/:quizId/result"
            element={<QuizResultPage />}
          />
          <Route path="/practice-ai" element={<AiPracticePage />} />
          <Route path="/ranking" element={<LeaderboardPage />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/friends/list" element={<FriendsPage />} />
          <Route path="/friends/friend-requests" element={<FriendsPage />} />
          <Route path="/friends/video-call-invites" element={<FriendsPage />} />
          <Route path="/account/profile" element={<Profile />} />
          <Route path="/account/stats" element={<Stats />} />
          <Route
            path="*"
            element={
              <div style={{ padding: "40px" }}>
                OK NHA
              </div>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;