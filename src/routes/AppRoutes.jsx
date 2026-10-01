import {ForgotPassword,ResetPassword,VerifyEmail,Level,Onboarding,AuthAction} from "../pages/AccountSetup/AccountSetup";
import InfoPage from "../pages/InfoPage";
import NotFoundPage from "../pages/NotFoundPage";
import { Routes, Route, Navigate } from "react-router-dom";

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

import QuizResultPage from "../pages/QuizResultPage/QuizResultPage";
import AiPracticePage from "../pages/AiPracticePage/AiPracticePage";
import LeaderboardPage from "../pages/LeaderboardPage/LeaderboardPage";
import FriendListPage from "../pages/Friends/FriendListPage";
import FriendRequestsPage from "../pages/Friends/FriendRequestsPage";
import VideoCallInvitesPage from "../pages/Friends/VideoCallInvitesPage";
import Dashboard from "../pages/Dashboard/Dashboard";
import Profile from "../pages/Profile/Profile";
import Stats from "../pages/Stats/Stats";
import VideoCallPage from "../pages/VideoCall/VideoCallPage";

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
      <Route path="/forgot-password" element={<ForgotPassword/>}/>
      <Route path="/reset-password" element={<ResetPassword/>}/>
      <Route path="/verify-email" element={<VerifyEmail/>}/>
      <Route path="/auth/action" element={<AuthAction/>}/>
      <Route path="/level" element={<ProtectedRoute setup><Level/></ProtectedRoute>}/>
      <Route path="/onboarding" element={<ProtectedRoute setup><Onboarding/></ProtectedRoute>}/>
      {['faq','terms','privacy','contact'].map(page=><Route key={page} path={`/${page}`} element={<InfoPage page={page}/>}/>)}
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
          element={<QuizPage />}
        />
        <Route path="/learning-path/quiz/:quizId/result" element={<QuizResultPage />} />
        <Route path="/practice-ai" element={<AiPracticePage />} />
        <Route path="/ranking" element={<LeaderboardPage />} />
        <Route path="/video" element={<VideoCallPage />} />
        <Route path="/video-call" element={<Navigate to="/video" replace />} />
        <Route path="/friends" element={<Navigate to="/friends/list" replace />} />
        <Route path="/friends/list" element={<FriendListPage />} />
        <Route path="/friends/friend-requests" element={<FriendRequestsPage />} />
        <Route path="/friends/video-call-invites" element={<VideoCallInvitesPage />} />
        <Route path="/account/profile" element={<Profile />} />
        <Route path="/account/stats" element={<Stats />} />

      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
