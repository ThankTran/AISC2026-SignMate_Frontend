import test from "node:test";
import assert from "node:assert/strict";
import { isVideoDemo } from "../src/services/videoCall/mode.js";

test("local development simulates calls without enabling mock lessons", () => {
  assert.equal(isVideoDemo({ DEV: true, VITE_USE_MOCK: "false", VITE_DEMO: "false" }), true);
});
test("production retains real calls by default", () => {
  assert.equal(isVideoDemo({ DEV: false, VITE_VIDEO_CALL_MODE: "auto" }), false);
  assert.equal(isVideoDemo({}), false);
});
test("video mode can explicitly override the environment", () => {
  assert.equal(isVideoDemo({ DEV: true, VITE_VIDEO_CALL_MODE: "real" }), false);
  assert.equal(isVideoDemo({ DEV: false, VITE_VIDEO_CALL_MODE: "demo" }), true);
  assert.equal(isVideoDemo({ VITE_DEMO: "true" }), true);
});
