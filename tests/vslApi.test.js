import test from "node:test";
import assert from "node:assert/strict";
import { createVslApi, resolveMediaUrl, VslApiError } from "../src/services/vslApi.js";

const mockResponse = (body, status = 200, contentType = "application/json") => ({
  ok: status >= 200 && status < 300,
  status,
  headers: new Headers({ "content-type": contentType }),
  json: async () => body,
  text: async () => (typeof body === "string" ? body : JSON.stringify(body)),
});

test("missing backend route explains how to recover instead of reporting an unknown word", async () => {
  const api = createVslApi({ fetcher: async () => mockResponse({ detail: "Not Found" }, 404) });
  await assert.rejects(api.segmentSentence("xin lỗi ban ngày"), (error) => {
    assert.match(error.message, /khởi động lại backend VSL/);
    return error.status === 404;
  });
});

test("resolveMediaUrl formats relative paths properly and handles base variations", () => {
  assert.equal(
    resolveMediaUrl("/api/v1/videos/clips/W0001.mp4", "/vsl"),
    "/vsl/api/v1/videos/clips/W0001.mp4",
  );
  assert.equal(
    resolveMediaUrl("api/v1/videos/clips/W0001.mp4", "/vsl/"),
    "/vsl/api/v1/videos/clips/W0001.mp4",
  );
  assert.equal(
    resolveMediaUrl("/static/generated/abc.mp4", "http://127.0.0.1:8000"),
    "http://127.0.0.1:8000/static/generated/abc.mp4",
  );
});

test("translateWordToVideo sends NFC normalized text and resolves returned media URLs", async () => {
  const calls = [];
  const api = createVslApi({
    base: "/vsl",
    fetcher: async (...args) => {
      calls.push(args);
      return mockResponse({
        normalized_text: "chào",
        labels: ["chào"],
        unknown_words: [],
        model: "dataset-exact",
        clips: [{ label: "chào", filename: "W00489.mp4" }],
        video_url: "/api/v1/videos/clips/W00489.mp4",
      });
    },
  });

  const result = await api.translateWordToVideo("  chào  ", { exact: true });
  assert.equal(calls.length, 1);
  const [url, options] = calls[0];
  assert.equal(url, "/vsl/api/v1/translate/text-to-vsl-video");
  assert.equal(options.method, "POST");
  assert.deepEqual(JSON.parse(options.body), { text: "chào", exact: true });
  assert.equal(result.video_url, "/vsl/api/v1/videos/clips/W00489.mp4");
  assert.equal(result.clips[0].video_url, "/vsl/api/v1/videos/clips/W00489.mp4");
});

test("translateWordToVideo rejects empty input before network call", async () => {
  const api = createVslApi({ base: "/vsl" });
  await assert.rejects(
    api.translateWordToVideo("    "),
    (err) => err instanceof VslApiError && err.status === 422,
  );
});

test("segmentSentence segments and formats relative clip URLs", async () => {
  const api = createVslApi({
    base: "/vsl",
    fetcher: async () =>
      mockResponse({
        original_text: "xin lỗi ban ngày",
        normalized_text: "xin lỗi ban ngày",
        tokens: [
          {
            text: "xin lỗi",
            supported: true,
            label: "xin lỗi",
            filename: "W03990.mp4",
            video_url: "/api/v1/videos/clips/W03990.mp4",
            suggestions: [],
          },
          {
            text: "ban ngày",
            supported: true,
            label: "ban ngày",
            filename: "W00089.mp4",
            video_url: "/api/v1/videos/clips/W00089.mp4",
            suggestions: [],
          },
        ],
        supported_count: 2,
        unsupported_count: 0,
        all_supported: true,
      }),
  });

  const res = await api.segmentSentence("xin lỗi ban ngày");
  assert.equal(res.tokens.length, 2);
  assert.equal(res.tokens[0].video_url, "/vsl/api/v1/videos/clips/W03990.mp4");
  assert.equal(res.all_supported, true);
});

test("translateVideoToText maps status errors into clear messages", async () => {
  const api = createVslApi({
    base: "/vsl",
    fetcher: async () => mockResponse({ detail: "Chỉ hỗ trợ MP4, MOV, AVI, MKV, WEBM" }, 415),
  });

  const fakeFile = new Blob(["fake video content"], { type: "text/plain" });
  await assert.rejects(
    api.translateVideoToText(fakeFile),
    (err) => err instanceof VslApiError && err.status === 415,
  );
});

test("cancellation abort signal propagates cleanly", async () => {
  const controller = new AbortController();
  const api = createVslApi({
    base: "/vsl",
    fetcher: async (_, opts) => {
      controller.abort();
      opts.signal.throwIfAborted();
    },
  });

  await assert.rejects(api.translateWordToVideo("chào", { signal: controller.signal }), {
    name: "AbortError",
  });
});

test("recognition uploads file and threshold without overriding multipart content type", async () => {
  const file = new Blob(["video"], { type: "video/mp4" });
  const api = createVslApi({
    fetcher: async (url, options) => {
      assert.equal(url, "/vsl/api/v1/translate/video-to-text");
      assert.equal(options.body.get("expected_signs"), "1");
      assert.equal(options.body.get("min_confidence"), "0.5");
      assert.equal(options.body.get("file").size, file.size);
      assert.equal(options.headers, undefined);
      return mockResponse({ labels: ["chào"] });
    },
  });
  assert.deepEqual((await api.translateVideoToText(file, { minConfidence: 0.5 })).labels, ["chào"]);
});
