import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProgressProvider } from "../src/contexts/ProgressContext";
import { useProgress } from "../src/hooks/useProgress";
import { CurrentUserContext } from "../src/hooks/useCurrentUser";
import { AuthContext } from "../src/hooks/useAuth";
import { accountApi, socialApi, learningApi } from "../src/services/api";
import { ToastProvider } from "../src/components/ui/ToastProvider";
import { ConfirmProvider } from "../src/components/ui/ConfirmDialog";
import QuizPage from "../src/pages/QuizPage/QuizPage";
import QuizResultPage from "../src/pages/QuizResultPage/QuizResultPage";
import { LessonSession } from "../src/pages/LessonPage/LessonPage";
import LessonResultModal from "../src/components/LessonPage/LessonResultModal";
import PublicOnlyRoute from "../src/routes/PublicOnlyRoute";
import ProtectedRoute from "../src/routes/ProtectedRoute";
import TestProgress from "./TestProgress";
import "../src/index.css";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const root = createRoot(document.getElementById("root")),
  results = [];
const check = (name, ok) => {
  results.push(`${ok ? "PASS" : "FAIL"} ${name}`);
  document.getElementById("results").textContent = results.join("\n");

  if (!ok) {
    throw Error(name);
  }
};

const render = async (element) => act(async () => root.render(element));
const click = async (element) => {
  if (!element) {
    throw Error("Missing button");
  }

  await act(async () => element.click());
};

const button = (text) =>
  [...document.querySelectorAll("button")].find((el) => el.textContent.includes(text));
let current,
  serverXp = 80,
  loads = 0,
  reads = [],
  offline = false,
  hold = null;
let notes = [{ id: "n1", message: "Thông báo từ server", type: "friend_request", read: false }];

accountApi.dashboard = async () => {
  loads++;

  if (offline) {
    throw Error("Mất mạng");
  }

  if (hold) {
    await hold;
  }

  return {
    stats: { xp: serverXp },
    chapters: [
      { id: 1, done: 0, total: 1, lessons: [{ id: 1, status: "active", title: "Bài 1" }] },
    ],
  };
};

accountApi.stats = async () => ({ xp: serverXp, xpLevel: 1 });
accountApi.leaderboard = async (scope) => ({
  entries: [{ id: scope, rank: 1, xp: serverXp, isMe: true }],
});
socialApi.notifications = async () => notes;
socialApi.unreadCount = async () => ({ count: notes.filter((row) => !row.read).length });
socialApi.read = async (id) => {
  reads.push(id);
  notes = notes.map((row) => ({ ...row, read: true }));
};

function Probe() {
  current = useProgress();

  return (
    <p>
      {current.status}: {current.stats.xp}
    </p>
  );
}

const profile = {
  uid: "fixture-only",
  _profileStatus: "ready",
  hasSetLevel: true,
  onboardingComplete: true,
  name: "Người kiểm thử",
};
const provider = (user) => (
  <CurrentUserContext.Provider value={user}>
    <ProgressProvider>
      <Probe />
    </ProgressProvider>
  </CurrentUserContext.Provider>
);
const questions = [
  {
    id: 1,
    options: [
      { id: "A", title: "Một" },
      { id: "B", title: "Hai" },
    ],
  },
];
const lesson = { id: 1, title: "Bài kiểm thử", maxHearts: 1, questions };
let finished = 0;
const wrong = async () => ({ hearts: 0, correct: false, correctOptionId: "B" });
const finish = async () => {
  finished++;

  return { passed: false, score: 0, xp: 0, title: "Bài kiểm thử" };
};

const lessonApp = (lessonData) => (
  <MemoryRouter>
    <TestProgress>
      <ConfirmProvider>
        <LessonSession lesson={lessonData} checkAnswer={wrong} finishAttempt={finish} />
      </ConfirmProvider>
    </TestProgress>
  </MemoryRouter>
);

try {
  const beforeStorage = JSON.stringify({ ...localStorage });

  await render(provider(profile));
  check(
    "server provider loads progress and both ranking scopes",
    current.source === "server" &&
      current.stats.xp === 80 &&
      current.levelLeaderboard[0].id === "level",
  );

  const before = loads;

  await act(async () => current.recordLesson(1, { passed: true, xp: 99999 }));
  check(
    "recordLesson only refetches; fabricated XP and completion ignored",
    loads === before + 1 && current.stats.xp === 80 && current.completedLessons === 0,
  );
  serverXp = 180;
  await act(async () => current.recordQuiz(1, { result: { xp: 5555 } }));
  check("recordQuiz displays fresh server XP only", current.stats.xp === 180);
  await act(async () => current.readNotifications(["n1"]));
  check(
    "readNotifications persists to API then refreshes",
    reads[0] === "n1" && current.notifications[0].read,
  );
  check(
    "real progress leaves localStorage untouched",
    JSON.stringify({ ...localStorage }) === beforeStorage,
  );
  offline = true;
  await act(async () => current.retry());
  check(
    "network failure shows error without mock substitution",
    current.status === "error" && current.stats.xp === 0,
  );
  offline = false;
  await act(async () => current.retry());
  check("retry recovers server data", current.status === "ready" && current.stats.xp === 180);

  let release;

  hold = new Promise((resolve) => {
    release = resolve;
  });
  await render(provider({ ...profile, uid: "second-user" }));
  check(
    "account change never displays prior user data",
    current.status === "loading" && current.stats.xp === 0,
  );
  hold = null;
  await act(async () => release());
  await render(provider({}));
  check("signed out provider clears progress", current.status === "idle" && current.stats.xp === 0);
  await render(lessonApp(lesson));
  await click(document.querySelector('[role="radio"]'));
  await click(button("Kiểm tra"));
  check("zero hearts on final question still calls finish", finished === 1);
  check(
    "failed modal replaces out-of-hearts on final question",
    document.querySelector('[role="dialog"]')?.textContent.includes("Chưa đạt, hãy thử lại") &&
      !button("Bài tiếp theo"),
  );
  await click(button("Luyện tập lại"));
  check(
    "retake resets answer without granting free hearts",
    document.querySelector('[role="dialog"]')?.textContent.includes("hết tim") &&
      document.querySelector('[aria-checked="true"]') === null,
  );
  await render(<div />);
  await render(lessonApp({ ...lesson, questions: [...questions, { ...questions[0], id: 2 }] }));
  await click(document.querySelector('[role="radio"]'));
  await click(button("Kiểm tra"));
  check(
    "hearts exhausted mid-lesson shows hearts dialog without finish",
    finished === 1 &&
      !document.querySelector('[role="dialog"]')?.textContent.includes("Chưa đạt, hãy thử lại") &&
      !!document.querySelector('[role="dialog"]'),
  );
  await render(
    <MemoryRouter>
      <TestProgress>
        <LessonResultModal
          lessonId={1}
          summary={{ passed: true, score: 100, xp: 0, xpPreviouslyAwarded: true }}
          onRetake={() => {}}
          onClose={() => {}}
          onNext={() => {}}
        />
      </TestProgress>
    </MemoryRouter>,
  );
  check(
    "passed retake shows exact zero XP with explanation",
    document.body.textContent.includes("Đã nhận XP bài này trước đó") &&
      document.body.textContent.includes("+0 XP") &&
      !!button("Bài tiếp theo"),
  );
  learningApi.quiz = async () => ({
    chapterId: 1,
    questions: [
      {
        id: 1,
        prompt: "Quan sát ký hiệu",
        options: [
          { key: "A", title: "Một" },
          { key: "B", title: "Hai" },
        ],
      },
    ],
  });
  await render(
    <MemoryRouter key="exam-quiz" initialEntries={["/quiz/1"]}>
      <TestProgress>
        <ConfirmProvider>
          <Routes>
            <Route path="/quiz/:quizId" element={<QuizPage />} />
          </Routes>
        </ConfirmProvider>
      </TestProgress>
    </MemoryRouter>,
  );
  await click(button("Một"));
  check(
    "quiz selection shows no grading before submission",
    !document.body.textContent.includes("Chính xác") &&
      !document.body.textContent.includes("Chưa đúng") &&
      button("Một").getAttribute("aria-pressed") === "true",
  );
  await click(button("Hai"));
  check(
    "quiz answer can change before submission",
    button("Hai").getAttribute("aria-pressed") === "true" &&
      button("Một").getAttribute("aria-pressed") === "false",
  );
  learningApi.quiz = async () => {
    throw Object.assign(Error("Locked"), { status: 403 });
  };

  await render(
    <MemoryRouter key="locked-quiz" initialEntries={["/quiz/1"]}>
      <TestProgress>
        <ToastProvider>
          <Routes>
            <Route path="/quiz/:quizId" element={<QuizPage />} />
            <Route path="/learning-path" element={<p id="path-destination">Lộ trình</p>} />
          </Routes>
        </ToastProvider>
      </TestProgress>
    </MemoryRouter>,
  );
  check(
    "API 403 redirects quiz to path with Vietnamese toast",
    !!document.querySelector("#path-destination") &&
      document.body.textContent.includes("Hãy hoàn thành các bài học"),
  );

  let resultCalls = 0;

  learningApi.quizResult = async () => {
    resultCalls++;

    return {
      chapterId: 1,
      score: 100,
      xp: 37,
      correctCount: 1,
      totalQuestions: 1,
      review: [{ id: 1, correct: true, selectedOptionId: "B", correctOptionId: "B" }],
      questions,
    };
  };

  await render(
    <MemoryRouter key="direct-result" initialEntries={["/result/1"]}>
      <TestProgress>
        <Routes>
          <Route path="/result/:quizId" element={<QuizResultPage />} />
        </Routes>
      </TestProgress>
    </MemoryRouter>,
  );
  check(
    "direct result URL loads API result and option labels",
    resultCalls === 1 &&
      document.body.textContent.includes("+37 XP") &&
      document.body.textContent.includes("Đáp án của bạn: Hai"),
  );

  const authCases = [
    ["anonymous login", null, profile, "/login", "form"],
    [
      "unfinished login",
      { emailVerified: true },
      { ...profile, hasSetLevel: false },
      "/login",
      "form",
    ],
    ["complete login", { emailVerified: true }, profile, "/login", "dashboard"],
    ["anonymous level", null, profile, "/level", "form"],
    ["unverified level", { emailVerified: false }, profile, "/level", "verify"],
  ];

  for (const [name, user, person, path, expected] of authCases) {
    await render(
      <MemoryRouter key={name} initialEntries={[path]}>
        <AuthContext.Provider value={{ user, loading: false }}>
          <CurrentUserContext.Provider value={person}>
            <Routes>
              <Route
                path="/login"
                element={
                  <PublicOnlyRoute>
                    <p id="auth-destination">form</p>
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/level"
                element={
                  <ProtectedRoute setup>
                    <p id="auth-destination">level</p>
                  </ProtectedRoute>
                }
              />
              <Route path="/dashboard" element={<p id="auth-destination">dashboard</p>} />
              <Route path="/verify-email" element={<p id="auth-destination">verify</p>} />
            </Routes>
          </CurrentUserContext.Provider>
        </AuthContext.Provider>
      </MemoryRouter>,
    );
    check(name, document.querySelector("#auth-destination")?.textContent === expected);
  }

  document.title = `PASS ${results.length} server progress checks`;
} catch (error) {
  document.title = "FAIL server progress";
  document.getElementById("results").textContent += "\n" + error.stack;
}
