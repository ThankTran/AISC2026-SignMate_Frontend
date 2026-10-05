import { UserPlus } from "lucide-react";
import { useFriends } from "../../hooks/useFriends";
import { useToast } from "../../hooks/useToast";
export default function AddFriendButton({ person }) {
  const { friends, sentRequests, addFriend } = useFriends();
  const toast = useToast();

  if (!person) {
    return null;
  }

  const isFriend = friends.some((friend) => friend.id === person.id || friend.name === person.name),
    sent = sentRequests.includes(person.id);

  return (
    <button
      type="button"
      className="vc-button vc-secondary"
      disabled={isFriend || sent}
      onClick={() => {
        addFriend(person.id);
        toast({ type: "success", message: `Đã gửi lời mời kết bạn với ${person.name}.` });
      }}
    >
      <UserPlus size={18} />
      {isFriend ? "Đã là bạn bè" : sent ? "Đã gửi lời mời" : "Kết bạn"}
    </button>
  );
}
