import { useLocation } from "react-router-dom";
import FriendListPage from "./FriendListPage";
import FriendRequestsPage from "./FriendRequestsPage";
import VideoCallInvitesPage from "./VideoCallInvitesPage";
export default function FriendsPage() {
  const { pathname } = useLocation();

  return pathname.endsWith("/friend-requests") ? (
    <FriendRequestsPage />
  ) : pathname.endsWith("/video-call-invites") ? (
    <VideoCallInvitesPage />
  ) : (
    <FriendListPage />
  );
}
