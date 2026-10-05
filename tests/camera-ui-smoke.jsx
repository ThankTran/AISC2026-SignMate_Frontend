import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import AiPracticePage from "../src/pages/AiPracticePage/AiPracticePage";
import DeviceCheck from "../src/components/VideoCall/DeviceCheck";
import { ConfirmProvider } from "../src/components/ui/ConfirmDialog";
import "../src/index.css";
import "../src/pages/VideoCall/VideoCallPage.css";
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

const click = async (el) => {
  await act(async () => el.click());
};

const visibility = async (hidden) =>
  act(async () => {
    Object.defineProperty(document, "hidden", { configurable: true, value: hidden });
    document.dispatchEvent(new Event("visibilitychange"));
  });
const button = (text) =>
  [...document.querySelectorAll("button")].find((el) => el.textContent.includes(text));

Object.defineProperty(navigator, "mediaDevices", {
  configurable: true,
  value: {
    getUserMedia: async () => {
      const error = new Error("Denied in test");

      error.name = "NotAllowedError";

      throw error;
    },
    enumerateDevices: async () => [],
  },
});

try {
  await act(async () =>
    root.render(
      <MemoryRouter>
        <ConfirmProvider>
          <AiPracticePage />
        </ConfirmProvider>
      </MemoryRouter>,
    ),
  );
  check(
    "VSL label and honest demo label",
    document.body.textContent.includes("VSL: Số đếm") &&
      document.body.textContent.includes("Chế độ demo"),
  );
  await visibility(true);
  await visibility(false);
  check("returning to idle tab never opens a summary", !document.querySelector("[role=dialog]"));
  check(
    "metrics unset before starting",
    document.querySelector(".ai-analytics__gauge-num").textContent === "--",
  );
  check(
    "no fake landmarks or mic controls",
    !document.querySelector("canvas") &&
      ![...document.querySelectorAll("button")].some((el) =>
        /mic/i.test(el.getAttribute("aria-label") || ""),
      ),
  );
  await click(button("Ký hiệu sau"));
  check(
    "next changes sign and progress",
    document.querySelector(".ai-practice__progress-text").textContent.includes("2 / 10"),
  );
  await click(document.querySelector('[aria-label="Xem hướng dẫn ký hiệu"]'));
  check(
    "guide has VSL media placeholder",
    document
      .querySelector('[role="dialog"]')
      .textContent.includes("Video ký hiệu VSL đang được cập nhật"),
  );
  await click(document.querySelector('[aria-label="Đóng hướng dẫn"]'));
  await click(button("Bắt đầu luyện tập"));
  check(
    "denied camera provides recovery instructions",
    document.body.textContent.includes("Chrome/Edge") && !!button("Thử lại"),
  );
  await visibility(true);
  await visibility(false);
  check(
    "returning after denied camera does not open summary",
    !document.querySelector("[role=dialog]"),
  );

  const denied = navigator.mediaDevices.getUserMedia;
  let stops = 0;

  navigator.mediaDevices.getUserMedia = async () => {
    const stream = new MediaStream();

    stream.getTracks = () => [{ stop: () => stops++ }];

    return stream;
  };

  const tick = async (ms) => act(async () => new Promise((resolve) => setTimeout(resolve, ms)));

  await click(button("Bắt đầu luyện tập"));
  for (let i = 0; i < 3; i++) {
    await tick(1050);
  }

  await tick(300);
  check(
    "recording has demo samples",
    document.querySelector(".ai-analytics__gauge-num").textContent !== "--",
  );
  await visibility(true);
  await visibility(false);
  check(
    "background pauses camera without opening summary",
    stops > 0 && !document.querySelector("[role=dialog]") && !!button("Bắt đầu luyện tập"),
  );
  await click(button("Bắt đầu luyện tập"));
  for (let i = 0; i < 3; i++) {
    await tick(1050);
  }

  await tick(300);
  await click(button("Dừng luyện tập"));
  check(
    "explicit stop opens one summary",
    document.querySelectorAll("[role=dialog]").length === 1 &&
      document.querySelector("[role=dialog]").textContent.includes("Tổng kết phiên demo"),
  );
  await act(async () =>
    document.activeElement.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    ),
  );
  await visibility(true);
  await visibility(false);
  check(
    "dismissed summary stays dismissed after tab return",
    !document.querySelector("[role=dialog]"),
  );
  navigator.mediaDevices.getUserMedia = denied;
  await act(async () =>
    root.render(
      <MemoryRouter>
        <DeviceCheck onReady={() => {}} onBack={() => {}} />
      </MemoryRouter>,
    ),
  );
  check("device check blocks entry before camera ready", button("Vào phòng").disabled);
  await click(button("Bật camera kiểm tra"));
  check(
    "device error retry available",
    document.querySelector('[role="alert"]')?.textContent.includes("quyền") && !!button("Thử lại"),
  );
} catch (error) {
  document.getElementById("results").textContent += "\nERROR " + error.stack;
}
