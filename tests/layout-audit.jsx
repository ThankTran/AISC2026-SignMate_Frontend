import {
  incomingScheduleRequestsData,
  incomingFriendRequestsData,
  scheduledSessionsData,
  friendsListData,
} from "../src/mockdata";

const loadFriends = async () => ({
  friends: friendsListData,
  incomingRequests: incomingFriendRequestsData,
  incomingScheduleRequests: incomingScheduleRequestsData,
  scheduledSessions: scheduledSessionsData,
});

import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import MainLayout from "../src/layouts/MainLayout/MainLayout";
import PageMetadata from "../src/components/PageMetadata";
import { ProgressProvider } from "../src/contexts/ProgressContext";
import { CurrentUserContext } from "../src/hooks/useCurrentUser";
import { AuthContext } from "../src/hooks/useAuth";
import { FriendsProvider } from "../src/contexts/FriendsContext";
import { ToastProvider } from "../src/components/ui/ToastProvider";
import { ConfirmProvider } from "../src/components/ui/ConfirmDialog";
import Dashboard from "../src/pages/Dashboard/Dashboard";
import Stats from "../src/pages/Stats/Stats";
import Profile from "../src/pages/Profile/Profile";
import LearningPath from "../src/pages/LearningPathPage/LearningPathPage";
import Leaderboard from "../src/pages/LeaderboardPage/LeaderboardPage";
import FriendList from "../src/pages/Friends/FriendListPage";
import FriendRequests from "../src/pages/Friends/FriendRequestsPage";
import Calendar from "../src/pages/Friends/VideoCallInvitesPage";
import VideoCall from "../src/pages/VideoCall/VideoCallPage";
import AiPractice from "../src/pages/AiPracticePage/AiPracticePage";
import Lesson from "../src/pages/LessonPage/LessonPage";
import Quiz from "../src/pages/QuizPage/QuizPage";
import QuizResult from "../src/pages/QuizResultPage/QuizResultPage";
import Welcome from "../src/pages/Welcome/Welcome";
import Login from "../src/pages/Login/Login";
import Register from "../src/pages/Register/Register";
import InfoPage from "../src/pages/InfoPage";
import {
  ForgotPassword,
  ResetPassword,
  VerifyEmail,
  Level,
  Onboarding,
} from "../src/pages/AccountSetup/AccountSetup";
import { accountApi, learningApi, callApi } from "../src/services/api";
import { initialProgress } from "../src/utils/progress";
import "../src/index.css";
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const user = {
  uid: "layout-test-only",
  name: "Nguyễn Minh Anh",
  displayName: "Nguyễn Minh Anh",
  email: "test@example.test",
  emailVerified: true,
  hasSetLevel: true,
  onboardingComplete: true,
  _profileStatus: "ready",
  level: "Cơ bản",
};

callApi.invitations = async () => [
  { id: "preview-invite", name: "Nguyễn Minh Anh", topic: "Gia đình và cuộc sống" },
];
accountApi.me = async () => ({
  ...user,
  bio: "Học ngôn ngữ ký hiệu Việt Nam.",
  userType: "hearing",
  privacy: { profile: "public", friendList: "friends", stats: "public" },
});

const questions = Array.from({ length: 8 }, (_, index) => ({
  id: index + 1,
  title: "Ký hiệu",
  question: "Ký hiệu trong video có nghĩa là gì?",
  videoUrl: "",
  options: [
    { id: "A", key: "A", title: "Xin chào", icon: "hand" },
    { id: "B", key: "B", title: "Cảm ơn", icon: "handHeart" },
    { id: "C", key: "C", title: "Tạm biệt", icon: "handshake" },
    { id: "D", key: "D", title: "Xin lỗi", icon: "hand" },
  ],
}));

learningApi.lesson = async () => ({
  id: 1,
  title: "Bảng chữ & Số",
  chapterId: 1,
  maxHearts: 5,
  questions,
});
learningApi.quiz = async () => ({
  chapterId: 1,
  title: "Kiểm tra chương 1",
  durationSeconds: 600,
  questions,
});

const seed = initialProgress();

seed.completedLessons = [1, 2, 3];
seed.quizResults[1] = {
  result: {
    id: "test-result",
    chapterId: 1,
    totalQuestions: 8,
    correctCount: 6,
    score: 75,
    xp: 40,
    review: questions.map((q, i) => ({
      id: q.id,
      title: q.question,
      correct: i < 6,
      selectedOptionId: "A",
      correctOptionId: i < 6 ? "A" : "B",
    })),
  },
  questions,
  elapsedSeconds: 180,
};

const appPages = [
  ["/dashboard", <Dashboard />],
  ["/learning-path", <LearningPath />],
  ["/ranking", <Leaderboard />],
  ["/account/stats", <Stats />],
  ["/account/profile", <Profile />],
  ["/friends/list", <FriendList />],
  ["/friends/friend-requests", <FriendRequests />],
  ["/friends/video-call-invites", <Calendar />],
  ["/video", <VideoCall />],
  ["/practice-ai", <AiPractice />],
  ["/learning-path/lesson/1", <Lesson />],
  ["/learning-path/quiz/1", <Quiz />],
  ["/learning-path/quiz/1/result", <QuizResult />],
];
const publicPages = [
  ["/", <Welcome />],
  ["/login", <Login />],
  ["/register", <Register />],
  ["/forgot-password", <ForgotPassword />],
  ["/reset-password", <ResetPassword />],
  ["/verify-email", <VerifyEmail />],
  ["/level", <Level />],
  ["/onboarding", <Onboarding />],
  ...["faq", "terms", "privacy", "contact"].map((page) => [`/${page}`, <InfoPage page={page} />]),
];
const root = createRoot(document.getElementById("root"));
const rows = [];

function visible(el) {
  const rect = el.getBoundingClientRect();

  return (
    rect.width > 0 &&
    rect.height > 0 &&
    getComputedStyle(el).visibility !== "hidden" &&
    !el.closest("[aria-hidden=true]")
  );
}

function textContrast(root) {
  const rgb = (value) => {
    const parts = value
      .match(/^rgba?\(([^)]+)\)/)?.[1]
      .split(/[,\s/]+/)
      .map(Number);
    return parts?.length >= 3 ? [...parts.slice(0, 3), parts[3] ?? 1] : null;
  };
  const over = (fg, bg) => fg.slice(0, 3).map((c, i) => c * fg[3] + bg[i] * (1 - fg[3]));
  const luminance = (c) =>
    c
      .map((v) => {
        v /= 255;
        return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
      })
      .reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
  const issues = [];
  for (const el of root.querySelectorAll("*")) {
    if (
      !visible(el) ||
      el.closest("[disabled],.sr-only") ||
      ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())
    )
      continue;
    const fg = rgb(getComputedStyle(el).color);
    if (!fg) continue;
    const layers = [];
    let known = true;
    for (let node = el; node; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (style.backgroundImage !== "none" || Number(style.opacity) < 1) {
        known = false;
        break;
      }
      const bg = rgb(style.backgroundColor);
      if (!bg) {
        known = false;
        break;
      }
      layers.push(bg);
      if (bg[3] === 1) break;
    }
    if (!known) continue;
    let bg = [255, 255, 255];
    for (const layer of layers.reverse()) bg = over(layer, bg);
    const l1 = luminance(over(fg, bg)),
      l2 = luminance(bg);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    if (ratio < 4.5)
      issues.push({
        selector: el.className || el.tagName,
        text: el.textContent.trim().slice(0, 35),
        ratio: +ratio.toFixed(2),
      });
  }
  return issues;
}

function audit(path) {
  const body = document.querySelector("#root"),
    headings = [...body.querySelectorAll("h1,h2,h3,h4,h5,h6")].filter(visible);
  const h1 = headings.filter((el) => el.tagName === "H1").length;
  const jumps = headings
    .filter((el, i) => i > 0 && Number(el.tagName[1]) > Number(headings[i - 1].tagName[1]) + 1)
    .map((el) => el.textContent.trim());
  const tinyText = [...body.querySelectorAll("*")]
    .filter(
      (el) =>
        visible(el) &&
        [...el.childNodes].some((node) => node.nodeType === 3 && node.textContent.trim()) &&
        parseFloat(getComputedStyle(el).fontSize) < 12,
    )
    .map((el) => el.className || el.tagName);
  const min = innerWidth <= 768 ? 44 : 24;
  const small = [
    ...body.querySelectorAll(
      "button,a[href],input:not([type=hidden]),select,textarea,[role=radio],[role=tab],[role=button]",
    ),
  ]
    .filter((el) => visible(el) && !el.disabled && !el.classList.contains("skip-link"))
    .filter((el) => {
      const hit = el.matches("input[type=radio],input[type=checkbox]")
        ? el.closest("label") || el
        : el;
      const r = hit.getBoundingClientRect(),
        after = getComputedStyle(el, "::after");

      return (
        Math.max(r.width, parseFloat(after.minWidth) || 0) < min - 0.1 ||
        Math.max(r.height, parseFloat(after.minHeight) || 0) < min - 0.1
      );
    })
    .map(
      (el) => el.getAttribute("aria-label") || el.textContent.trim().slice(0, 35) || el.className,
    );
  const overflow = [...body.querySelectorAll("*")]
    .filter(
      (el) =>
        visible(el) &&
        el.getBoundingClientRect().right > innerWidth + 1 &&
        !el.closest(
          ".lb-table-wrap,.st-bars,.calendar-month-grid,.month-calendar__scroll,.theory__timeline",
        ),
    )
    .map((el) => el.className || el.tagName)
    .slice(0, 8);

  return {
    path,
    width: innerWidth,
    h1,
    jumps,
    contrast: textContrast(body),
    tinyText: [...new Set(tinyText)],
    small: [...new Set(small)],
    overflow,
    documentOverflow: document.documentElement.scrollWidth > innerWidth + 1,
    title: document.title,
  };
}

const single = new URLSearchParams(location.search).get("page");

for (const [path, element] of [...appPages, ...publicPages].filter(
  ([path]) => !single || path === single,
)) {
  try {
    await act(async () => {
      root.render(
        <MemoryRouter key={path} initialEntries={[path]}>
          <AuthContext.Provider
            value={{
              user: { ...user, emailVerified: false },
              refreshUser: async () => {},
              logout: async () => {},
              setRegistering: () => {},
            }}
          >
            <CurrentUserContext.Provider value={user}>
              <ProgressProvider initialState={seed}>
                <FriendsProvider loader={loadFriends}>
                  <ToastProvider>
                    <ConfirmProvider>
                      <PageMetadata />
                      <Routes>
                        {appPages.some(([route]) => route === path) ? (
                          <Route element={<MainLayout />}>
                            <Route
                              path={path
                                .replace("/lesson/1", "/lesson/:lessonId")
                                .replace("/quiz/1", "/quiz/:quizId")}
                              element={element}
                            />
                          </Route>
                        ) : (
                          <Route path={path} element={element} />
                        )}
                      </Routes>
                    </ConfirmProvider>
                  </ToastProvider>
                </FriendsProvider>
              </ProgressProvider>
            </CurrentUserContext.Provider>
          </AuthContext.Provider>
        </MemoryRouter>,
      );
    });
    await act(async () => {
      await new Promise(requestAnimationFrame);
    });
    rows.push(audit(path));
  } catch (error) {
    rows.push({ path, error: error.message });
  }

  document.getElementById("results").textContent = JSON.stringify(rows, null, 2);
}

document.title = `Layout audit: ${rows.length} pages at ${innerWidth}px`;
