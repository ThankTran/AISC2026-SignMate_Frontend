import Avatar from "../ui/Avatar";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useConfirm } from "../../hooks/useConfirm";
import { useEffect, useId, useRef, useState } from "react";
import { UserRound, BarChart3, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const HeaderSettings = ({
  items = [
    { label: "Trợ giúp", icon: "help", path: "/faq" },
    { label: "Hồ sơ", icon: "profile", path: "/account/profile" },
    { label: "Thống kê", icon: "stats", path: "/account/stats" },
  ],
}) => {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");
  const pendingRef = useRef(false);
  const triggerRef = useRef(null);
  const dropdownId = useId();
  const wrapperRef = useRef(null);
  const navigate = useNavigate();
  const user = useCurrentUser();
  const confirm = useConfirm();
  const { logout } = useAuth();

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

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (path) => {
    navigate(path);
    setOpen(false);
  };

  const handleSignOut = async () => {
    if (pendingRef.current) {
      return;
    }

    setOpen(false);
    triggerRef.current?.focus();

    if (
      !(await confirm({
        title: "Đăng xuất?",
        message: "Bạn muốn đăng xuất khỏi SignMate?",
        confirmLabel: "Đăng xuất",
      }))
    ) {
      return;
    }

    pendingRef.current = true;
    setSigningOut(true);
    setError("");

    try {
      await logout();
      setOpen(false);
    } catch {
      setError("Không thể đăng xuất. Vui lòng thử lại.");
      setOpen(true);
    } finally {
      pendingRef.current = false;
      setSigningOut(false);
    }
  };

  return (
    <div
      className="header-settings"
      ref={wrapperRef}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          setOpen(false);
          triggerRef.current?.focus();
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className="header-icon-btn"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Menu tài khoản"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={dropdownId}
        title="Tài khoản"
      >
        <Avatar user={user} size={36} />
      </button>

      {open && (
        <div className="header-settings__dropdown" id={dropdownId} aria-busy={signingOut}>
          {items.map((item) => {
            const Icon = ICONS[item.icon] || UserRound;

            return (
              <button
                key={item.path}
                type="button"
                className="header-settings__item"
                disabled={signingOut}
                onClick={() => handleSelect(item.path)}
              >
                <Icon size={16} strokeWidth={1.8} />
                <span>{item.label}</span>
              </button>
            );
          })}
          <hr className="header-settings__divider" />
          <button
            type="button"
            className="header-settings__item header-settings__item--logout"
            disabled={signingOut}
            onClick={handleSignOut}
          >
            <LogOut size={16} strokeWidth={1.8} />
            <span>{signingOut ? "Đang đăng xuất…" : "Đăng xuất"}</span>
          </button>
          {error && (
            <p className="header-settings__error" role="alert">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default HeaderSettings;
