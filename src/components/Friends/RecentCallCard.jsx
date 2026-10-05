import "./RecentCallCard.css";

const RecentCallCard = ({ call, onAddFriend, isRequesting, isRequested }) => {
  const buttonLabel = isRequested ? "Đã gửi lời mời" : "Kết bạn";

  return (
    <div className="recent-call-card">
      <div className="recent-call-card__avatar-wrap">
        <img src={call.avatar} alt={call.name} className="recent-call-card__avatar" />
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
        disabled={isRequested || isRequesting}
      >
        {isRequesting ? "Đang gửi..." : buttonLabel}
      </button>
    </div>
  );
};

export default RecentCallCard;
