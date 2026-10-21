import { act } from "react";
import { createRoot } from "react-dom/client";
import AiPracticePage from "../src/pages/AiPracticePage/AiPracticePage";
import { ProgressContext } from "../src/hooks/useProgress";
import { practiceApi } from "../src/services/api";
import { handSign } from "../src/services/handSign";
import "../src/index.css";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const params = new URLSearchParams(location.search);
if (params.has("mobile"))
  document.getElementById("root").style.cssText = "width:390px;max-width:100%;margin:auto";
const results = [],
  root = createRoot(document.getElementById("root"));
const check = (name, ok) => {
  results.push(`${ok ? "PASS" : "FAIL"} ${name}`);
  document.getElementById("results").textContent = results.join("\n");
  if (!ok) throw Error(name);
};
const button = (text) =>
  [...document.querySelectorAll("button")].find((el) => el.textContent.includes(text));
const click = async (text) => {
  await act(async () => button(text).click());
};
const wait = async (ms) => {
  await act(async () => new Promise((r) => setTimeout(r, ms)));
};
let ready = false,
  started = 0,
  submitted = 0,
  finishEvaluation;
const canvas = document.createElement("canvas");
canvas.width = 640;
canvas.height = 480;
canvas.getContext("2d").fillRect(0, 0, 640, 480);
setInterval(() => canvas.getContext("2d").fillRect(0, 0, 640, 480), 100);
Object.defineProperty(navigator, "mediaDevices", {
  configurable: true,
  value: { getUserMedia: async () => canvas.captureStream(5) },
});
window.MediaRecorder = class {
  static isTypeSupported() {
    return true;
  }
  state = "inactive";
  mimeType = "video/webm";
  start() {
    this.state = "recording";
    started++;
  }
  stop() {
    this.state = "inactive";
    this.ondataavailable({ data: new Blob(["test"], { type: this.mimeType }) });
    this.onstop();
  }
};
practiceApi.start = async () => ({ id: "test-session" });
practiceApi.finish = async () => ({ id: "test-session", xp: 0 });
handSign.lessons = async () => ["Xin lỗi"];
handSign.sample = () => undefined;
handSign.framing = async () => ({
  ready,
  message: ready ? "Mặt và hai vai rõ trong hình" : "Điều chỉnh vị trí để thấy đủ hai vai",
});
handSign.evaluate = async () => {
  submitted++;
  return new Promise((resolve) => {
    finishEvaluation = resolve;
  });
};
const until = async (predicate) => {
  for (let attempt = 0; attempt < 60 && !predicate(); attempt++) await wait(100);
};
try {
  await act(async () =>
    root.render(
      <ProgressContext.Provider value={{ retry: () => {} }}>
        <AiPracticePage />
      </ProgressContext.Provider>,
    ),
  );
  await click("Luyện tập trước camera");
  await click("Mở camera");
  await wait(850);
  check(
    "Camera preview opens before countdown",
    !!document.querySelector("video").srcObject === false &&
      !!document.querySelector(".cam-viewport video").srcObject &&
      started === 0 &&
      !document.querySelector(".cam-viewport__countdown"),
  );
  check(
    "Orange framing blocks countdown",
    !!document.querySelector(".cam-viewport--adjust") && button("Căn chỉnh").disabled,
  );
  ready = true;
  await until(() => !!document.querySelector(".cam-viewport--ready"));
  check(
    "Green framing enables manual start",
    !!document.querySelector(".cam-viewport--ready") && !button("Sẵn sàng").disabled,
  );
  await click("Sẵn sàng");
  ready = false;
  await until(() => !document.querySelector(".cam-viewport__countdown"));
  check(
    "Lost framing cancels countdown",
    !document.querySelector(".cam-viewport__countdown") && started === 0,
  );
  ready = true;
  await until(() => !!document.querySelector(".cam-viewport--ready"));
  await click("Sẵn sàng");
  await until(() => started === 1);
  check("Records only after three second countdown", started === 1);
  await click("Chấm động tác");
  await wait(100);
  check(
    "Processing shown inside score panel",
    !!document.querySelector(".ai-analytics[aria-busy=true] .ai-analytics__processing") &&
      submitted === 1,
  );
  if (params.has("processing")) {
    document.getElementById("results").textContent += "\nPREVIEW processing";
  } else {
    await act(async () =>
      finishEvaluation({
        status: "incorrect_label",
        recognition: { status: "mismatch", predicted_label: "SECRET_OTHER_SIGN" },
        form: { score: null },
        feedback: [{ message: "Model guessed SECRET_OTHER_SIGN" }],
      }),
    );
    check(
      "Mismatch does not reveal predicted word",
      !document.body.textContent.includes("SECRET_OTHER_SIGN") &&
        document.body.textContent.includes("Không khớp yêu cầu"),
    );
    check(
      "Both hands are listed without invented scores",
      document.querySelector(".ai-analytics").textContent.includes("Tay trái") &&
        document.querySelector(".ai-analytics").textContent.includes("Tay phải") &&
        document.querySelector(".ai-analytics").textContent.includes("Không chấm"),
    );
  }
} catch (error) {
  document.getElementById("results").textContent += "\nERROR: " + error.message;
}
