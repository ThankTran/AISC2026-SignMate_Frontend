import { useEffect, useRef, useState } from "react";
import { Settings, UserRound, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeaderSettings = ({
  items = [
    { label: "Hồ sơ", icon: "profile", path: "/account/profile" },
    { label: "Thống kê", icon: "stats", path: "/account/stats" },
  ],
}) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  const ICONS = {
    profile: UserRound,
    stats: BarChart3,
  };

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

  const handleSelect = (path) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <div className="header-settings" ref={wrapperRef}>
      <button
        type="button"
        className="header-icon-btn"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Cài đặt"
        title="Cài đặt"
      >
        <Settings size={18} strokeWidth={1.8} />
      </button>

      {open && (
        <div className="header-settings__dropdown">
          {items.map((item) => {
            const Icon = ICONS[item.icon] || UserRound;

            return (
              <button
                key={item.path}
                type="button"
                className="header-settings__item"
                onClick={() => handleSelect(item.path)}
              >
                <Icon size={16} strokeWidth={1.8} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HeaderSettings;