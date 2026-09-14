import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";

const HeaderNotification = ({ notifications = [] }) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="header-notification" ref={wrapperRef}>
      <button
        type="button"
        className="header-icon-btn"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Thông báo"
        title="Thông báo"
      >
        <Bell size={18} strokeWidth={1.8} />

        {unreadCount > 0 && (
          <span className="header-notification__badge">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="header-notification__dropdown">
          <div className="header-notification__dropdown-title">
            Thông báo
          </div>

          {notifications.length === 0 ? (
            <div className="header-notification__empty">
              Không có thông báo mới
            </div>
          ) : (
            <ul className="header-notification__list">
              {notifications.map((item) => (
                <li
                  key={item.id}
                  className={`header-notification__item ${
                    !item.read ? "header-notification__item--unread" : ""
                  }`}
                >
                  <span className="header-notification__item-title">
                    {item.title}
                  </span>
                  <span className="header-notification__item-time">
                    {item.time}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default HeaderNotification;