import { useProgress } from "../../hooks/useProgress";
import { useEffect, useId, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../hooks/useToast";
import DataState from "../ui/DataState";
import { notificationPath } from "../../api/notificationAdapter";
export default function HeaderNotification() {
  const {
    notifications,
    readNotifications,
    readAllNotifications,
    unreadCount,
    notificationStatus = "ready",
    notificationError,
    retryNotifications,
  } = useProgress();
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false);
  const wrapper = useRef(null),
    trigger = useRef(null),
    id = useId(),
    navigate = useNavigate(),
    toast = useToast();
  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };

  const markRead = async (ids, all = false) => {
    if (busy) {
      return false;
    }

    setBusy(true);

    try {
      if (all) {
        await readAllNotifications();
      } else {
        await readNotifications(ids);
      }

      return true;
    } catch (error) {
      toast({ type: "error", error });

      return false;
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    const outside = (event) => {
      if (!wrapper.current?.contains(event.target)) {
        setOpen(false);
        trigger.current?.focus();
      }
    };

    document.addEventListener("pointerdown", outside);

    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);

  const unread = unreadCount ?? notifications.filter((row) => !row.read).length;

  return (
    <div
      className="header-notification"
      ref={wrapper}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          close();
        }
      }}
    >
      <button
        ref={trigger}
        className="header-icon-btn"
        onClick={() => setOpen((value) => !value)}
        aria-label={
          notificationStatus === "error"
            ? "Thông báo, chưa tải được dữ liệu"
            : `Thông báo, ${unread} chưa đọc`
        }
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={id}
      >
        <Bell size={20} />
        {unread > 0 && <span className="header-notification__badge">{unread}</span>}
      </button>
      {open && (
        <div id={id} role="dialog" aria-label="Thông báo" className="header-notification__dropdown">
          <div className="header-notification__dropdown-title">Thông báo</div>
          <DataState
            status={notificationStatus}
            error={notificationError}
            retry={retryNotifications}
          >
            <button
              className="notification-read-all"
              disabled={busy || unread === 0}
              onClick={() => markRead([], true)}
            >
              Đánh dấu tất cả đã đọc
            </button>
            {!notifications.length ? (
              <p role="status">Không có thông báo mới</p>
            ) : (
              <ul className="header-notification__list">
                {notifications.map((item) => (
                  <li key={item.id}>
                    <button
                      disabled={busy}
                      className={`header-notification__item ${!item.read ? "header-notification__item--unread" : ""}`}
                      onClick={async () => {
                        if (!item.read && !(await markRead([item.id]))) {
                          return;
                        }

                        close();
                        navigate(item.path || notificationPath(item.type));
                      }}
                    >
                      <span className="header-notification__item-title">{item.title}</span>
                      <span className="header-notification__item-time">{item.time}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </DataState>
        </div>
      )}
    </div>
  );
}
