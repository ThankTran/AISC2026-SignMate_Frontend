import test from "node:test";
import assert from "node:assert/strict";
import { createTheoryVideoApi, videoUrlFromResponse } from "../src/services/theoryVideoApi.js";

const payload = {
  model: "dataset-exact",
  labels: ["ă"],
  unknown_words: [],
  video_url: "/static/generated/test.mp4",
};
const response = (body = payload, status = 200) => ({
  ok: status === 200,
  status,
  json: async () => body,
});

test("sends exact text without auth and caches a successful video", async () => {
  const calls = [];
  const api = createTheoryVideoApi({
    fetcher: async (...args) => {
      calls.push(args);
      return response();
    },
  });
  assert.equal((await api.load("Ă")).videoUrl, "/vsl/static/generated/test.mp4");
  await api.load("Ă");
  assert.equal(calls.length, 1);
  assert.deepEqual(JSON.parse(calls[0][1].body), { text: "Ă", exact: true });
  assert.equal(calls[0][1].credentials, "omit");
  assert.equal(calls[0][1].headers.Authorization, undefined);
});

test("missing media is explicit and errors can be retried", async () => {
  let calls = 0;
  const api = createTheoryVideoApi({
    fetcher: async () => (++calls === 1 ? response({}, 404) : response()),
  });
  await assert.rejects(api.load("13"), (error) => error.status === 404);
  await api.load("13");
  assert.equal(calls, 2);
});

test("refuses legacy or approximate translations", async () => {
  const api = createTheoryVideoApi({
    fetcher: async () => response({ ...payload, model: "gpt-oss:120b" }),
  });
  await assert.rejects(api.load("Ă"), /khớp chính xác/);
});

test("media URL resolves under proxy and rejects unrelated hosts or traversal", () => {
  assert.equal(
    videoUrlFromResponse(payload.video_url, "https://example.test/vsl/"),
    "https://example.test/vsl/static/generated/test.mp4",
  );
  for (const path of ["https://evil.test/a.mp4", "/static/generated/../secret.mp4", null]) {
    assert.throws(() => videoUrlFromResponse(path, "/vsl"));
  }
});

test("cancellation propagates and never caches an incomplete request", async () => {
  const controller = new AbortController();
  const api = createTheoryVideoApi({
    fetcher: async (_, options) => {
      controller.abort();
      options.signal.throwIfAborted();
    },
  });
  await assert.rejects(api.load("A", { signal: controller.signal }), { name: "AbortError" });
});
