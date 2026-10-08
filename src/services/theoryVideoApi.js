const DEFAULT_BASE = "/vsl";

export class TheoryVideoError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = "TheoryVideoError";
    this.status = status;
  }
}

export function videoUrlFromResponse(path, base) {
  // Only accept media served by the translation service; never forward auth tokens.
  if (typeof path !== "string" || !/^\/static\/generated\/[a-zA-Z0-9_-]+\.mp4$/.test(path)) {
    throw new TheoryVideoError("Máy chủ trả về đường dẫn video không hợp lệ.");
  }
  return `${base.replace(/\/$/, "")}${path}`;
}

export function createTheoryVideoApi({ base = DEFAULT_BASE, fetcher = fetch } = {}) {
  const cache = new Map();
  const root = base.replace(/\/$/, "");
  return {
    async load(term, { signal } = {}) {
      const text = term.trim().normalize("NFC");
      if (!text) throw new TheoryVideoError("Chưa chọn ký hiệu.");
      if (cache.has(text)) return cache.get(text);
      let response;
      try {
        response = await fetcher(`${root}/api/v1/translate/text-to-vsl-video`, {
          method: "POST",
          credentials: "omit",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, exact: true }),
          signal: signal
            ? AbortSignal.any([signal, AbortSignal.timeout(200000)])
            : AbortSignal.timeout(200000),
        });
      } catch (error) {
        if (signal?.aborted) throw error;
        throw new TheoryVideoError(
          error.name === "TimeoutError"
            ? "Tạo video mất quá lâu. Vui lòng thử lại."
            : "Không kết nối được dịch vụ video. Vui lòng thử lại.",
        );
      }
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new TheoryVideoError(
          response.status === 404
            ? "Chưa có video cho ký hiệu này trong thư viện."
            : response.status === 503
              ? "Thư viện video chưa sẵn sàng. Vui lòng thử lại sau."
              : "Không tải được video ký hiệu. Vui lòng thử lại.",
          response.status,
        );
      }
      if (
        body?.model !== "dataset-exact" ||
        body?.unknown_words?.length ||
        body?.labels?.length !== 1
      ) {
        throw new TheoryVideoError(
          "Dịch vụ chưa hỗ trợ video khớp chính xác cho bài học. Vui lòng cập nhật máy chủ.",
        );
      }
      const result = {
        videoUrl: videoUrlFromResponse(body.video_url, root),
        start: 0,
        label: body.labels[0],
      };
      cache.set(text, result);
      return result;
    },
  };
}

export const theoryVideoApi = createTheoryVideoApi({
  base: import.meta.env?.VITE_VSL_API_URL?.trim() || DEFAULT_BASE,
});
