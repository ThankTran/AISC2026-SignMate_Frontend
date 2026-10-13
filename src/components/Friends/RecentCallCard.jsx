import "./RecentCallCard.css";
import Avatar from "../ui/Avatar";

const RecentCallCard = ({ call, onAddFriend, isRequesting, isRequested }) => {
  const buttonLabel = call.isFriend ? "Đã là bạn bè" : isRequested ? "Đã gửi lời mời" : "Kết bạn";

  return (
    <div className="recent-call-card">
      <div className="recent-call-card__avatar-wrap">
        <Avatar user={call} size={64} className="recent-call-card__avatar" />
      </div>

      <p className="recent-call-card__name text-h3">{call.name}</p>
      <p className="recent-call-card__time text-caption">
        {call.time} · {call.duration}
      </p>

      <button
        type="button"
        className={`recent-call-card__action ${
          isRequested ? "recent-call-card__action--sent" : ""
        }`}
        onClick={() => onAddFriend(call.id)}
        disabled={call.isFriend || isRequested || isRequesting}
      >
        {isRequesting ? "Đang gửi..." : buttonLabel}
      </button>
    </div>
  );
};

export default RecentCallCard;
