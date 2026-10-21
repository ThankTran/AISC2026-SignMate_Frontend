const BASE = (import.meta.env.VITE_HANDSIGN_API_URL || "/handsign").replace(/\/$/, "");

async function request(path, options) {
  let response;

  try {
    response = await fetch(`${BASE}${path}`, options);
  } catch {
    throw new Error("Không thể kết nối HandSign. Hãy kiểm tra dịch vụ AI và thử lại.");
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));

    throw new Error(
      typeof body.detail === "string"
        ? body.detail
        : "HandSign chưa thể xử lý yêu cầu. Vui lòng thử lại.",
    );
  }

  return response.json();
}

const MOCK_LESSONS = [
  "Xin chào",
  "Cảm ơn",
  "Tạm biệt",
  "Xin lỗi",
  "Gia đình",
  "Bàn tay",
  "Cần giúp đỡ",
];

export const handSign = {
  lessons: (signal) => import.meta.env.VITE_USE_MOCK === "true" ? Promise.resolve(MOCK_LESSONS) : request("/lessons", { signal }),
  sample: (label) => `${BASE}/samples/${encodeURIComponent(label)}?format=webm`,
  evaluate: (label, video, signal) => {
    const data = new FormData();

    data.append("label", label);
    data.append("video", video, video.type.includes("mp4") ? "attempt.mp4" : "attempt.webm");

    return request("/evaluate", { method: "POST", body: data, signal });
  },
};
export const formRating = (status) =>
  ({
    excellent: "Rất tốt",
    good: "Tốt",
    needs_practice: "Cần luyện tập thêm",
    far_from_reference: "Chưa khớp với mẫu",
  })[status] || "Chưa có đánh giá";
