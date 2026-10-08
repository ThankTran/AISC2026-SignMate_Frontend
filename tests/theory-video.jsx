import { createRoot } from "react-dom/client";
import { MemoryRouter, Route, Routes, useSearchParams } from "react-router-dom";
import TestProgress from "./TestProgress";
import TheoryPreview from "../src/pages/LessonPage/TheoryPreview";
import "../src/index.css";

function LessonFixture() {
  const [search] = useSearchParams();
  return search.get("step") === "practice" ? (
    <h1>Đã chuyển sang kiểm tra</h1>
  ) : (
    <TheoryPreview lesson={{ id: "video-integration", title: "Bảng chữ & Số" }} />
  );
}

createRoot(document.getElementById("root")).render(
  <MemoryRouter>
    <TestProgress>
      <main style={{ "--page-gutter": "24px", maxWidth: 1150, margin: "auto" }}>
        <Routes>
          <Route path="/" element={<LessonFixture />} />
          <Route path="/learning-path" element={<p>Đã quay về lộ trình</p>} />
        </Routes>
      </main>
    </TestProgress>
  </MemoryRouter>,
);
