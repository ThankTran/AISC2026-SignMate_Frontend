import { Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout/MainLayout";
import ProtectedRoute from "./ProtectedRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";

import Welcome from "../pages/Welcome/Welcome";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
// import VerifyEmail from "../pages/VerifyEmail/VerifyEmail";
// import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";
// import ResetPassword from "../pages/ResetPassword/ResetPassword";
// import Level from "../pages/Level/Level";

import LearningPathPage from "../pages/LearningPathPage/LearningPathPage";
import LessonPage from "../pages/LessonPage/LessonPage";
import QuizPage from "../pages/QuizPage/QuizPage";
import QuizRouteGuard from "../pages/QuizPage/QuizRouteGuard";
import QuizResultPage from "../pages/QuizResultPage/QuizResultPage";
import AiPracticePage from "../pages/AiPracticePage/AiPracticePage";
import LeaderboardPage from "../pages/LeaderboardPage/LeaderboardPage";
import FriendsPage from "../pages/Friends/FriendsPage";
import Dashboard from "../pages/Dashboard/Dashboard";
import Profile from "../pages/Profile/Profile";
import Stats from "../pages/Stats/Stats";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ---------- Public: không sidebar ---------- */}
      <Route path="/" element={<Welcome />} />

      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        }
      />
      {/* <Route path="/verify-email" element={<VerifyEmail />} /> */}
      {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}
      {/* <Route path="/reset-password" element={<ResetPassword />} /> */}

      {/* ---------- Cần đăng nhập, không sidebar ---------- */}
      {/* <Route
        path="/level"
        element={
          <ProtectedRoute>
            <Level />
          </ProtectedRoute>
        }
      /> */}

      {/* ---------- Cần đăng nhập, có sidebar (MainLayout) ---------- */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
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
        <Route path="/learning-path/quiz/:quizId/result" element={<QuizResultPage />} />
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
          element={<div style={{ padding: "40px" }}>OK NHA</div>}
        />
      </Route>
    </Routes>
  );
}