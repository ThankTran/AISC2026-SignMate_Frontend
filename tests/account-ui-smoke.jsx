import { ProgressProvider } from "../src/contexts/ProgressContext";
import { initialProgress } from "../src/utils/progress";

const progressSeed = initialProgress();

import { act, useState } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import LeaderboardPage from "../src/pages/LeaderboardPage/LeaderboardPage";
import ProfilePage from "../src/pages/Profile/Profile";
import { StatsContent } from "../src/pages/Stats/Stats";
import { CurrentUserContext } from "../src/hooks/useCurrentUser";
import { ConfirmProvider } from "../src/components/ui/ConfirmDialog";
import { ToastProvider } from "../src/components/ui/ToastProvider";
import { useConfirm } from "../src/hooks/useConfirm";
import { accountApi } from "../src/services/api";
import { statsHistory } from "../src/utils/statsHistory";
import "../src/index.css";
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const today = new Date("2026-09-30T12:00:00");
const history = statsHistory([], 90, today).map((row, index) => ({
  ...row,
  xp: index % 3 === 0 ? 40 : 0,
  studySeconds: index % 3 === 0 ? 300 : 0,
}));
const stats = {
  xp: 1650,
  streak: 4,
  bestStreak: 9,
  curriculumLevel: "Cơ bản",
  activityHistory: history,
  aiAccuracyHistory: [],
};
const chapters = [
  { id: 1, title: "Ký hiệu cơ bản", done: 2, total: 3, status: "active" },
  { id: 2, title: "Giao tiếp hằng ngày", done: 0, total: 3, status: "locked" },
];
const user = {
  name: "Minh Anh",
  displayName: "Minh Anh",
  email: "test@example.test",
  xp: 1650,
  bio: "Học ngôn ngữ ký hiệu Việt Nam.",
  userType: "deaf",
};

accountApi.leaderboard = async () => ({
  entries: [{ id: "me", name: user.name, weeklyXp: 20, totalXp: 1650, isMe: true }],
});
accountApi.me = async () => ({
  ...user,
  privacy: { profile: "public", friendList: "friends", stats: "public" },
});
function Fixture() {
  const [view, setView] = useState("leaderboard"),
    [result, setResult] = useState("");
  const confirm = useConfirm();

  return (
    <>
      <nav aria-label="Test pages">
        {["leaderboard", "stats", "profile"].map((name) => (
          <button key={name} id={`view-${name}`} onClick={() => setView(name)}>
            {name}
          </button>
        ))}
        <button
          id="typed-confirm"
          onClick={async () =>
            setResult(
              String(
                await confirm({
                  title: "Xóa dữ liệu thử nghiệm",
                  message: "Xác nhận",
                  confirmationText: "DELETE",
                  confirmLabel: "Xóa dữ liệu thử nghiệm",
                }),
              ),
            )
          }
        >
          Typed confirm
        </button>
        <output id="confirm-result">{result}</output>
      </nav>
      {view === "leaderboard" ? (
        <LeaderboardPage />
      ) : view === "stats" ? (
        <StatsContent stats={stats} chapters={chapters} user={user} today={today} />
      ) : (
        <ProfilePage />
      )}
    </>
  );
}

const root = createRoot(document.getElementById("root"));
const results = [];
const check = (name, ok) => {
  results.push(`${ok ? "PASS" : "FAIL"} ${name}`);
  document.getElementById("results").textContent = results.join("\n");

  if (!ok) {
    throw Error(name);
  }
};

const click = async (selector) => {
  await act(async () => document.querySelector(selector).click());
};

const key = async (key) => {
  await act(async () =>
    document.activeElement.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true })),
  );
};

const setInput = async (el, value) => {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
};

try {
  await act(async () =>
    root.render(
      <MemoryRouter>
        <CurrentUserContext.Provider value={user}>
          <ProgressProvider initialState={progressSeed}>
            <ToastProvider>
              <ConfirmProvider>
                <Fixture />
              </ConfirmProvider>
            </ToastProvider>
          </ProgressProvider>
        </CurrentUserContext.Provider>
      </MemoryRouter>,
    ),
  );
  check(
    "semantic ranking table has scoped headers",
    document.querySelectorAll('thead th[scope="col"]').length === 5 &&
      document.querySelectorAll('tbody th[scope="row"]').length === 26,
  );
  check(
    "avatar defaults to 40px",
    getComputedStyle(document.querySelector(".lb-table .ui-avatar")).width === "40px",
  );
  check(
    "riser format reports current rank",
    /Tăng \d+ hạng · hiện #\d+/.test(document.querySelector(".lb-riser").textContent),
  );
  check(
    "header has no duplicate avatar or streak",
    !document.querySelector(".lb-header .ui-avatar"),
  );
  await click(".lb-filter:nth-child(1)");
  check(
    "same Level label stays static with separate count",
    document.querySelector(".lb-filter:nth-child(1)").textContent.startsWith("Cùng Level ("),
  );
  check(
    "small same-Level group shows guidance",
    document.querySelector(".lb-empty")?.textContent.includes("Chưa đủ bạn học cùng Level"),
  );
  await click(".lb-empty button");
  check(
    "all users restores podium and table",
    document.querySelectorAll(".lb-podium__person").length === 3 &&
      document.querySelectorAll("tbody tr").length === 26,
  );
  await click("#view-stats");
  check(
    "chapter badge shows percentage",
    document.querySelector(".st-chapter__badge--active").textContent === "67%",
  );
  check(
    "heatmap contains 84 accessible day cells",
    document.querySelectorAll('.st-heatmap [role="listitem"]').length === 84,
  );

  const before = document.querySelector(".st-time strong").textContent;

  await click(".st-filter button");
  check(
    "7 day filter updates duration",
    document.querySelector(".st-time strong").textContent !== before &&
      document.querySelector(".st-filter button").getAttribute("aria-pressed") === "true",
  );
  check(
    "AI empty state excludes demo results",
    document
      .querySelector(".st-charts")
      .textContent.includes("Số liệu chế độ demo không được tính"),
  );
  await click("#view-profile");
  check(
    "neutral hearing terminology",
    document.querySelector(".pf").textContent.includes("Người nghe") &&
      !document.querySelector(".pf").textContent.includes("Người bình thường"),
  );
  check("unused camera action removed", !document.querySelector('[aria-label="Đổi ảnh đại diện"]'));

  const group = document.querySelector('[role="radiogroup"]');

  check("radio group has one tab stop", group.querySelectorAll('[tabindex="0"]').length === 1);
  group.querySelector("button").focus();
  await key("ArrowRight");
  check("arrow moves radio focus", document.activeElement === group.children[1]);
  await click("#typed-confirm");
  check(
    "typed confirmation initially disabled",
    document.querySelector(".ui-confirm .ui-primary").disabled,
  );
  await setInput(document.querySelector(".ui-confirm input"), "DELETE");
  check(
    "exact typed confirmation enables action",
    !document.querySelector(".ui-confirm .ui-primary").disabled,
  );
  await click(".ui-confirm .ui-primary");
  check(
    "confirmation resolves true",
    document.querySelector("#confirm-result").textContent === "true",
  );
  await click("#typed-confirm");
  check(
    "typed confirmation resets after reopening",
    document.querySelector(".ui-confirm input").value === "" &&
      document.querySelector(".ui-confirm .ui-primary").disabled,
  );
  await key("Escape");
  await click("#view-stats");
  check("no horizontal document overflow", document.documentElement.scrollWidth <= innerWidth);
  document.title = `PASS — ${results.length} account and statistics checks`;
} catch (error) {
  document.title = "FAIL — account and statistics";
  document.getElementById("results").textContent += "\n" + error.stack;
}
