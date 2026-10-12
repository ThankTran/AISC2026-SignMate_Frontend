import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import DemoCallPage from "../src/pages/VideoCall/DemoCallPage";
import "../src/index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MemoryRouter initialEntries={[`/video-call${window.location.search}`]}>
      <DemoCallPage />
    </MemoryRouter>
  </StrictMode>,
);
