import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { FriendsProvider } from "../src/contexts/FriendsContext";
import { CurrentUserContext } from "../src/hooks/useCurrentUser";
import { ToastContext } from "../src/hooks/useToast";
import { socialApi, callApi } from "../src/services/api";
import FriendsWorkspace from "../src/pages/Friends/FriendsWorkspace";
import "../src/index.css";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const root = createRoot(document.getElementById("root"));
const results = [];
const check = (name, ok) => {
  results.push(`${ok ? "PASS" : "FAIL"} ${name}`);
  document.getElementById("results").textContent = results.join("\n");
  if (!ok) throw new Error(name);
};
const friend = { id: "test-friend", name: "Bạn kiểm thử", avatar: "/logo-signmate.png" };
socialApi.friends = async () => [friend];
socialApi.requests = async () => [];
socialApi.appointments = async () => [];
callApi.history = async () => [];
socialApi.ping = async () => ({});
let submitted;
socialApi.schedule = async (body) => {
  submitted = body;
};
function Controls({ handleSchedule, openQuickInvite }) {
  return (
    <>
      <button onClick={() => handleSchedule(friend)}>Hẹn lịch</button>
      <button onClick={() => openQuickInvite("2030-06-10")}>+</button>
    </>
  );
}
try {
  await act(async () =>
    root.render(
      <MemoryRouter>
        <CurrentUserContext.Provider value={{ uid: "test-only" }}>
          <ToastContext.Provider value={() => {}}>
            <FriendsProvider>
              <FriendsWorkspace Content={Controls} />
            </FriendsProvider>
          </ToastContext.Provider>
        </CurrentUserContext.Provider>
      </MemoryRouter>,
    ),
  );
  await act(async () =>
    [...document.querySelectorAll("button")].find((b) => b.textContent === "Hẹn lịch").click(),
  );
  check(
    "server friend schedule button opens date/time form",
    !!document.querySelector('[role="dialog"] input[type="date"]'),
  );
  await act(async () => document.querySelector('[aria-label="Đóng hẹn lịch"]').click());
  await act(async () =>
    [...document.querySelectorAll("button")].find((b) => b.textContent === "+").click(),
  );
  check("calendar plus opens friend/time form", !!document.querySelector('[role="dialog"] select'));
  await act(async () =>
    document
      .querySelector("form")
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })),
  );
  check(
    "quick invite submits selected friend and timezone-qualified time to API",
    submitted?.partnerId === friend.id &&
      submitted.startsAt === new Date("2030-06-10T19:30").toISOString(),
  );
  check("successful submission closes quick invite", !document.querySelector('[role="dialog"]'));
  document.title = `PASS ${results.length} Appointment UI checks`;
  await act(async () => root.unmount());
} catch (error) {
  document.title = "FAIL Appointment UI";
  document.getElementById("results").textContent += "\n" + error.stack;
}
