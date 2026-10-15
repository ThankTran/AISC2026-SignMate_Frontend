import { act } from "react";
import { createRoot } from "react-dom/client";
import SignSequencePlayer from "../src/pages/TranslatePage/components/SignSequencePlayer";
import SignVideoPlayer from "../src/pages/TranslatePage/components/SignVideoPlayer";
import SentenceToSignPanel from "../src/pages/TranslatePage/components/SentenceToSignPanel";
import WordToSignPanel from "../src/pages/TranslatePage/components/WordToSignPanel";
import SupportedVocabularyPicker from "../src/pages/TranslatePage/components/SupportedVocabularyPicker";
import vslApi from "../src/services/vslApi";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
HTMLMediaElement.prototype.play = function () {
  return Promise.resolve();
};
HTMLMediaElement.prototype.pause = function () {};
let reloads = 0;
HTMLMediaElement.prototype.load = function () {
  reloads++;
};
const root = createRoot(document.getElementById("root"));
const results = [];
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const render = async (element) => {
  await act(async () => root.render(element));
};
const click = async (element) => {
  assert(element, "Missing control");
  await act(async () => element.click());
};
const button = (label) =>
  [...document.querySelectorAll("button")].find((el) => el.textContent.includes(label));
const input = async (element, value) => {
  await act(async () => {
    Object.getOwnPropertyDescriptor(
      element.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype,
      "value",
    ).set.call(element, value);
    element.dispatchEvent(new Event("input", { bubbles: true }));
  });
};
const run = async (name, callback) => {
  try {
    await render(null);
    await callback();
    results.push(`PASS ${name}`);
  } catch (error) {
    results.push(`FAIL ${name}: ${error.message}`);
  }
  document.getElementById("results").textContent = results.join("\n");
};
const playlist = [0, 1].map((id) => ({ id, text: "chào", video_url: "/videos/vsl/D0489.mp4" }));
const tokens = playlist.map((item) => ({ ...item, supported: true, label: "chào" }));
vslApi.getVocabularySummary = async () => ({
  dictionary_count: 2,
  recognition_count: 1,
  sample_words: ["chào"],
  recognition_labels: ["chào"],
});
vslApi.segmentSentence = async () => ({
  tokens,
  all_supported: true,
  supported_count: 2,
  unsupported_count: 0,
});
vslApi.searchVocabulary = async () => [];

await run("sequence pause/resume and speed preserve position", async () => {
  await render(<SignSequencePlayer playlist={playlist} />);
  await click(document.querySelector('[aria-label="Phát"]'));
  const video = document.querySelector("video");
  video.currentTime = 2;
  await click(document.querySelector('[aria-label="Tạm dừng"]'));
  assert(video.currentTime === 2, "Pause rewound clip");
  await click(document.querySelector('[aria-label="Phát"]'));
  await click(button("0.5x"));
  assert(video.currentTime === 2 && video.playbackRate === 0.5, "Speed/resume rewound clip");
  await click(document.querySelector('[aria-label="Ký hiệu kế tiếp"]'));
  assert(document.querySelector("video") !== video, "Repeated clip reused previous media position");
});
await run("single video speed and error retry", async () => {
  await render(<SignVideoPlayer videoUrl="/videos/vsl/D0489.mp4" autoPlay />);
  const video = document.querySelector("video");
  video.currentTime = 2;
  await click(button("0.5x"));
  assert(video.currentTime === 2, "Speed rewound clip");
  await act(async () => video.dispatchEvent(new Event("error")));
  const before = reloads;
  await click(button("Thử tải lại"));
  assert(
    !document.querySelector('[role="alert"]') && reloads > before,
    "Retry did not clear error/reload",
  );
});
await run("editing sentence and opening picker preserve active clip", async () => {
  await render(<SentenceToSignPanel draftSentence="chào chào" />);
  await click(button("Phân tích câu"));
  await click(document.querySelector('[aria-label="Chuyển đến ký hiệu 2: chào"]'));
  await input(document.querySelector("textarea"), "chào chào thêm");
  assert(
    document.querySelector(".sign-seq-player__position-chip").textContent.includes("2 / 2"),
    "Editing reset playlist",
  );
  await click(button("Chèn từ vựng"));
  assert(
    document.querySelector(".sign-seq-player__position-chip").textContent.includes("2 / 2"),
    "Picker reset playlist",
  );
});
await run("clear discards pending word response", async () => {
  let resolve;
  vslApi.translateWordToVideo = () =>
    new Promise((done) => {
      resolve = done;
    });
  await render(<WordToSignPanel draftWord="chào" />);
  await click(document.querySelector('[aria-label="Dịch sang ký hiệu"]'));
  await click(document.querySelector('[aria-label="Xóa nội dung"]'));
  await act(async () => resolve({ labels: ["chào"], video_url: "/videos/vsl/D0489.mp4" }));
  assert(!document.querySelector("video"), "Stale result appeared after clear");
});
await run("unsupported input is rendered as text", async () => {
  vslApi.translateWordToVideo = async () => {
    throw Object.assign(new Error("missing"), { status: 404 });
  };
  vslApi.lookupWord = async () => ({ suggestions: [] });
  await render(<WordToSignPanel draftWord={'<img src=x onerror="alert(1)">'} />);
  await click(document.querySelector('[aria-label="Dịch sang ký hiệu"]'));
  assert(!document.querySelector(".w2s-panel__alert img"), "Input interpreted as HTML");
  assert(
    document.querySelector('[role="alert"]').textContent.includes("<img"),
    "Literal text missing",
  );
});
await run("clearing pending vocabulary search exits loading", async () => {
  vslApi.searchVocabulary = () => new Promise(() => {});
  await render(<SupportedVocabularyPicker isOpen onClose={() => {}} onSelectWord={() => {}} />);
  await input(document.querySelector("input"), "chào");
  await act(async () => new Promise((resolve) => setTimeout(resolve, 300)));
  await click(document.querySelector('[aria-label="Xóa tìm kiếm"]'));
  assert(!document.querySelector(".vocab-picker-loading"), "Spinner stuck after clear");
});
document.title = results.some((line) => line.startsWith("FAIL"))
  ? "FAIL translation regressions"
  : `PASS ${results.length} translation regressions`;
await render(null);
