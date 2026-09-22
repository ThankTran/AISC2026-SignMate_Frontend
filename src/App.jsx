import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import MainLayout from "./layouts/MainLayout/MainLayout";
import FriendsPage from "./pages/Friends/FriendsPage";
import VideoCallPage from "./pages/VideoCall/VideoCallPage";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/video" element={<VideoCallPage />} />
          <Route path="/video-call" element={<VideoCallPage />} />
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
