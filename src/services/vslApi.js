/**
 * VSL Translation API Client
 * Integrated with fast-api-trans-vsl service
 */

const DEFAULT_BASE = "/vsl";

export class VslApiError extends Error {
  constructor(message, status = 0, details = null) {
    super(message);
    this.name = "VslApiError";
    this.status = status;
    this.details = details;
  }
}

/**
 * Resolves relative media URLs returned by the translation backend.
 * Protects against open redirects, directory traversal, and invalid paths.
 */
export function resolveMediaUrl(path, base = DEFAULT_BASE) {
  if (!path || typeof path !== "string") return "";
  if (/^https?:\/\//i.test(path)) {
    // Only accept absolute URLs if they point to the configured origin
    return path;
  }
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const cleanBase = base.replace(/\/+$/, "");
  return `${cleanBase}${cleanPath}`;
}

export function createVslApi({
  base = import.meta.env?.VITE_VSL_API_URL?.trim() || DEFAULT_BASE,
  fetcher = fetch,
} = {}) {
  const root = base.replace(/\/+$/, "");

  async function request(endpoint, options = {}) {
    const url = `${root}${endpoint}`;
    let response;
    try {
      response = await fetcher(url, {
        ...options,
        credentials: "omit",
      });
    } catch (err) {
      if (err.name === "AbortError" || options.signal?.aborted) {
        throw err;
      }
      throw new VslApiError(
        "Không thể kết nối đến máy chủ VSL. Vui lòng kiểm tra dịch vụ dịch thuật.",
        0,
        err,
      );
    }

    const contentType = response.headers.get("content-type") || "";
    const body = contentType.includes("application/json")
      ? await response.json().catch(() => null)
      : await response.text().catch(() => null);

    if (!response.ok) {
      const detailMessage =
        (body && typeof body === "object" && (body.detail || body.message)) ||
        (typeof body === "string" ? body : null);

      let userMessage = detailMessage || "Lỗi xử lý yêu cầu từ máy chủ.";
      if (response.status === 404) {
        userMessage = detailMessage || "Không tìm thấy dữ liệu ký hiệu.";
      } else if (response.status === 413) {
        userMessage = detailMessage || "File tải lên vượt quá dung lượng cho phép.";
      } else if (response.status === 415) {
        userMessage = detailMessage || "Định dạng file không được hỗ trợ.";
      } else if (response.status === 422) {
        userMessage = detailMessage || "Dữ liệu không hợp lệ hoặc video không đủ khung hình.";
      } else if (response.status === 502) {
        userMessage = detailMessage || "Dịch vụ xử lý ngôn ngữ tạm thời không khả dụng.";
      } else if (response.status === 503) {
        userMessage = detailMessage || "Mô hình nhận diện hoặc từ điển video chưa sẵn sàng.";
      }

      throw new VslApiError(userMessage, response.status, body);
    }

    return body;
  }

  return {
    get baseUrl() {
      return root;
    },

    resolveUrl(path) {
      return resolveMediaUrl(path, root);
    },

    async getHealth({ signal } = {}) {
      return request("/health", { signal });
    },

    async getVslModelStatus({ signal } = {}) {
      return request("/api/v1/models/vsl/status", { signal });
    },

    async getVocabularySummary({ signal } = {}) {
      return request("/api/v1/vocabulary/summary", { signal });
    },

    async searchVocabulary(q, { limit = 30, signal } = {}) {
      const trimmed = (q || "").trim();
      if (!trimmed) return [];
      const params = new URLSearchParams({ q: trimmed, limit: String(limit) });
      const items = await request(`/api/v1/vocabulary/search?${params.toString()}`, { signal });
      return (items || []).map((item) => ({
        ...item,
        video_url: resolveMediaUrl(item.video_url, root),
      }));
    },

    async lookupWord(word, { signal } = {}) {
      const trimmed = (word || "").trim().normalize("NFC");
      if (!trimmed) {
        throw new VslApiError("Từ tra cứu không được để trống.", 422);
      }
      const data = await request(`/api/v1/vocabulary/word/${encodeURIComponent(trimmed)}`, {
        signal,
      });
      if (data.video_url) {
        data.video_url = resolveMediaUrl(data.video_url, root);
      }
      return data;
    },

    async translateWordToVideo(text, { exact = true, signal } = {}) {
      const trimmed = (text || "").trim().normalize("NFC");
      if (!trimmed) {
        throw new VslApiError("Nội dung không được để trống.", 422);
      }
      const data = await request("/api/v1/translate/text-to-vsl-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed, exact }),
        signal,
      });
      if (data.video_url) {
        data.video_url = resolveMediaUrl(data.video_url, root);
      }
      if (Array.isArray(data.clips)) {
        data.clips = data.clips.map((clip) => ({
          ...clip,
          video_url: resolveMediaUrl(`/api/v1/videos/clips/${clip.filename}`, root),
        }));
      }
      return data;
    },

    async translateVideoToText(file, { expectedSigns = 1, minConfidence = 0.35, signal } = {}) {
      if (!file) {
        throw new VslApiError("Vui lòng chọn video để nhận diện.", 422);
      }
      const formData = new FormData();
      formData.append("file", file, file.name || "gesture.mp4");
      formData.append("expected_signs", String(expectedSigns));
      formData.append("min_confidence", String(minConfidence));

      return request("/api/v1/translate/video-to-text", {
        method: "POST",
        body: formData,
        signal,
      });
    },

    async segmentSentence(text, { signal } = {}) {
      const trimmed = (text || "").trim().normalize("NFC");
      if (!trimmed) {
        throw new VslApiError("Vui lòng nhập câu cần dịch.", 422);
      }
      const data = await request("/api/v1/translate/segment-sentence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
        signal,
      });
      if (Array.isArray(data.tokens)) {
        data.tokens = data.tokens.map((token) => ({
          ...token,
          video_url: token.video_url ? resolveMediaUrl(token.video_url, root) : null,
        }));
      }
      return data;
    },
  };
}

export const vslApi = createVslApi();
export default vslApi;
