import { useState, useRef, useEffect } from "react";
import { Calendar, Video, MoreVertical, UserMinus, User } from "lucide-react";
import { Link } from "react-router-dom";
import Avatar from "../ui/Avatar";
import "./FriendListItem.css";

const FriendListItem = ({ friend, onSchedule, onCall, onRemove }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <article className={`friend-item-card ${friend.isOnline ? "friend-item-card--online" : ""}`}>
      <div className="friend-item-card__main">
        {/* Avatar với status dot */}
        <div className="friend-item-card__avatar-wrap">
          <Avatar user={friend} size={50} className="friend-item-card__avatar" />
          <span
            className={`friend-item-card__status-dot ${
              friend.isOnline ? "friend-item-card__status-dot--online" : ""
            }`}
            aria-hidden="true"
          />
        </div>

        {/* Thông tin người bạn */}
        <div className="friend-item-card__details">
          <div className="friend-item-card__name-row">
            <h3 className="friend-item-card__name" title={friend.name}>
              {friend.name}
            </h3>
            {friend.isOnline && (
              <span className="friend-item-card__online-badge">
                <span className="online-pulse" aria-hidden="true" />
                Online
              </span>
            )}
          </div>
          <p
            className={`friend-item-card__status-text ${
              friend.isOnline ? "friend-item-card__status-text--online" : ""
            }`}
          >
            {friend.statusText}
          </p>
        </div>
      </div>

      {/* Hành động chính và menu phụ */}
      <div className="friend-item-card__actions">
        {friend.isOnline ? (
          <button
            type="button"
            className="friend-item-card__btn-call"
            aria-label={`Gọi video trực tiếp cho ${friend.name}`}
            onClick={() => onCall?.(friend)}
          >
            <Video size={16} strokeWidth={2} />
            <span>Gọi ngay</span>
          </button>
        ) : (
          <button
            type="button"
            className="friend-item-card__btn-schedule"
            aria-label={`Hẹn lịch luyện tập với ${friend.name}`}
            onClick={() => onSchedule?.(friend)}
          >
            <Calendar size={15} strokeWidth={1.8} />
            <span>Hẹn lịch</span>
          </button>
        )}

        {/* Nút Hẹn lịch phụ khi online */}
        {friend.isOnline && (
          <button
            type="button"
            className="friend-item-card__btn-icon"
            aria-label={`Hẹn lịch với ${friend.name}`}
            title="Hẹn lịch buổi sau"
            onClick={() => onSchedule?.(friend)}
          >
            <Calendar size={15} strokeWidth={1.8} />
          </button>
        )}

        {/* More options dropdown menu */}
        <div className="friend-item-card__menu-wrap" ref={menuRef}>
          <button
            type="button"
            className="friend-item-card__btn-icon friend-item-card__btn-more"
            aria-label={`Tùy chọn quản lý với ${friend.name}`}
            aria-expanded={isMenuOpen}
            aria-haspopup="true"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            <MoreVertical size={16} strokeWidth={1.8} />
          </button>

          {isMenuOpen && (
            <div className="friend-item-card__dropdown" role="menu">
              <button
                type="button"
                className="friend-item-card__dropdown-item"
                role="menuitem"
                onClick={() => {
                  setIsMenuOpen(false);
                  onSchedule?.(friend);
                }}
              >
                <Calendar size={15} strokeWidth={1.8} />
                <span>Hẹn lịch luyện tập</span>
              </button>

              <Link
                to={`/account/profile?user=${encodeURIComponent(friend.id)}`}
                className="friend-item-card__dropdown-item"
                role="menuitem"
                onClick={() => setIsMenuOpen(false)}
              >
                <User size={15} strokeWidth={1.8} />
                <span>Xem hồ sơ</span>
              </Link>

              <div className="friend-item-card__dropdown-divider" />

              <button
                type="button"
                className="friend-item-card__dropdown-item friend-item-card__dropdown-item--danger"
                role="menuitem"
                onClick={() => {
                  setIsMenuOpen(false);
                  onRemove?.(friend);
                }}
              >
                <UserMinus size={15} strokeWidth={1.8} />
                <span>Hủy kết bạn</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default FriendListItem;
