import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import MainLayout from "./layouts/MainLayout/MainLayout";
import LearningPathPage from "./pages/LearningPathPage/LearningPathPage";
import LessonPage from "./pages/LessonPage/LessonPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/learning-path" element={<LearningPathPage />} />
          <Route path="/learning-path/lesson/:lessonId" element={<LessonPage />} />
          <Route
            path="*"
            element={
              <div style={{ padding: "40px" }}>
                OK NHA
              </div>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;