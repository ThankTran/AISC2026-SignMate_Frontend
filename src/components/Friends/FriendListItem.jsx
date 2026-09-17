import { Calendar, Video } from "lucide-react";

import "./FriendListItem.css";

const FriendListItem = ({ friend, onSchedule, onCall }) => {
  return (
    <div className="friend-item">
      <div className="friend-item__left">
        <div className="friend-item__avatar-wrap">
          <img
            src={friend.avatar}
            alt={friend.name}
            className="friend-item__avatar"
          />

          <span
            className={`friend-item__status-dot ${
              friend.isOnline ? "friend-item__status-dot--online" : ""
            }`}
            aria-hidden="true"
          />
        </div>

        <div className="friend-item__info">
          <p className="friend-item__name text-h3">{friend.name}</p>
          <p
            className={`friend-item__status-text ${
              friend.isOnline ? "friend-item__status-text--online" : ""
            }`}
          >
            {friend.statusText}
          </p>
        </div>
      </div>

      <div className="friend-item__actions">
        <button
          type="button"
          className="friend-item__schedule-btn"
          onClick={() => onSchedule?.(friend)}
        >
          <Calendar size={14} strokeWidth={1.8} />
          <span>Hẹn lịch</span>
        </button>

        <button
          type="button"
          className="friend-item__call-btn"
          aria-label={`Gọi video cho ${friend.name}`}
          title={`Gọi video cho ${friend.name}`}
          onClick={() => onCall?.(friend)}
        >
          <Video size={16} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
};

export default FriendListItem;
