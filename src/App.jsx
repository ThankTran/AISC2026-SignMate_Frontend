import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import MainLayout from "./layouts/MainLayout/MainLayout";

import LearningPathPage from "./pages/LearningPathPage/LearningPathPage";
import LessonPage from "./pages/LessonPage/LessonPage";
import AiPracticePage from "./pages/AiPracticePage/AiPracticePage";
import FriendsPage from "./pages/Friends/FriendsPage";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/learning-path" element={<LearningPathPage />} />
          <Route path="/learning-path/lesson/:lessonId" element={<LessonPage />} />
          <Route path="/practice-ai" element={<AiPracticePage />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/friends/list" element={<FriendsPage />} />
          <Route path="/friends/friend-requests" element={<FriendsPage />} />
          <Route path="/friends/video-call-invites" element={<FriendsPage />} />
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
