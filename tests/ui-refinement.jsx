import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import Profile from "../src/pages/Profile/Profile";
import Skeleton from "../src/components/ui/Skeleton";
import { CurrentUserContext } from "../src/hooks/useCurrentUser";
import { ToastProvider } from "../src/components/ui/ToastProvider";
import { accountApi } from "../src/services/api";
import "../src/index.css";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const root = createRoot(document.getElementById("root"));
const results = [];
const check = (name, passed) => {
  results.push({ name, passed });
  if (!passed) throw new Error(name);
};
const privacy = { profile: "public", friendList: "friends", stats: "public" };
let writes = 0;
let savedPrivacy;
let deletes = 0;
const user = {
  uid: "ui-test-only",
  displayName: "Test User",
  email: "test@example.test",
  privacy,
  _profileStatus: "ready",
  _updateProfile() {},
};
accountApi.me = async () => user;
accountApi.update = async (patch) => {
  writes++;
  savedPrivacy = patch.privacy;
  return patch;
};
accountApi.deleteAccount = async () => {
  deletes++;
  throw new Error("Deletion is blocked in this fixture");
};
const click = async (node) => act(async () => node.click());
const button = (label) =>
  [...document.querySelectorAll("button")].find((node) => node.textContent === label);
const input = async (node, value) =>
  act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(node, value);
    node.dispatchEvent(new Event("input", { bubbles: true }));
  });
try {
  await act(async () =>
    root.render(
      <MemoryRouter>
        <CurrentUserContext.Provider value={user}>
          <ToastProvider>
            <Profile />
          </ToastProvider>
        </CurrentUserContext.Provider>
      </MemoryRouter>,
    ),
  );
  await click(document.querySelector('[aria-label="Hồ sơ cá nhân"] button:last-child'));
  check("privacy selection does not save automatically", writes === 0);
  await click(button("Lưu thay đổi"));
  check("explicit save persists privacy once", writes === 1 && savedPrivacy.profile === "private");
  await click(document.querySelector('[aria-label="Hồ sơ cá nhân"] button:last-child'));
  await click(button("Hủy thay đổi"));
  check(
    "cancel discards draft without API mutation",
    writes === 1 &&
      document
        .querySelector('[aria-label="Hồ sơ cá nhân"] button:first-child')
        .getAttribute("aria-checked") === "true",
  );
  await click(button("Xóa tài khoản"));
  check(
    "one deletion modal contains email and password",
    document.querySelectorAll('[role="dialog"]').length === 1 &&
      document.querySelectorAll(".pf-account-form input").length === 2,
  );
  const submit = document.querySelector(".pf-account-form button:last-child");
  check("deletion disabled initially", submit.disabled);
  await input(document.querySelector('.pf-account-form input:not([type="password"])'), user.email);
  check("email alone cannot enable deletion", submit.disabled);
  await input(document.querySelector('.pf-account-form input[type="password"]'), "fixture-only");
  check("both confirmations enable deletion", !submit.disabled);
  await input(
    document.querySelector('.pf-account-form input:not([type="password"])'),
    "wrong@example.test",
  );
  check("changing email disables deletion again", submit.disabled);
  check("no delete request was sent", deletes === 0);
  await click(button("Hủy"));
  await act(async () => root.render(<Skeleton variant="dashboard" />));
  check("loader hidden initially", !document.querySelector('[role="status"]'));
  await act(async () => new Promise((resolve) => setTimeout(resolve, 150)));
  check(
    "short wait shows inline status",
    !!document.querySelector(".ui-loading-status") && !document.querySelector(".ui-skeleton"),
  );
  await act(async () => new Promise((resolve) => setTimeout(resolve, 900)));
  check("long wait shows dashboard skeleton", !!document.querySelector(".ui-skeleton--dashboard"));
  document.title = "PASS — UI refinement";
} catch (error) {
  results.push({ error: error.message });
  document.title = "FAIL — UI refinement";
}
document.getElementById("results").textContent = JSON.stringify(results, null, 2);
