import { curriculumLevel } from "../../utils/learningLevels";
import { Link } from "react-router-dom";
import Avatar from "../ui/Avatar";
import { PanelLeftClose, PanelLeft } from "lucide-react";

import { sidebarItems } from "../../mockdata";
import SidebarItem from "./SidebarItem";

import "./Sidebar.css";

const Sidebar = ({ collapsed = false, onToggle, user }) => {
  return (
    <aside className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}`}>
      {/* ================= HEADER ================= */}
      <div className="sidebar__header">
        <div className="sidebar__logo-wrapper">
          {/* Logo - dùng chung 1 ảnh cho cả 2 trạng thái */}
          <Link to="/dashboard" aria-label="SignMate — Trang chủ">
            <img src="/logo-signmate.png" alt="SignMate" className="sidebar__logo" />
          </Link>

          {/* Nút toggle - chỉ hiện khi hover vào vùng logo */}
          {onToggle && (
            <button
              type="button"
              className="sidebar__toggle-hover"
              onClick={onToggle}
              aria-label={collapsed ? "Mở sidebar" : "Thu gọn sidebar"}
            >
              {collapsed ? (
                <PanelLeft size={17} strokeWidth={1.8} />
              ) : (
                <PanelLeftClose size={17} strokeWidth={1.8} />
              )}
            </button>
          )}
        </div>
      </div>

      {/* ================= NAVIGATION ================= */}
      <nav className="sidebar__nav">
        {sidebarItems.map((item, index) => {
          if (item.section) {
            return (
              <div className="sidebar__section" key={item.section}>
                <div className="sidebar__section-title">{item.section}</div>

                <div className="sidebar__section-items">
                  {item.children?.map((child) => (
                    <SidebarItem key={child.label} item={child} collapsed={collapsed} />
                  ))}
                </div>
              </div>
            );
          }

          return <SidebarItem key={item.label || index} item={item} collapsed={collapsed} />;
        })}
      </nav>

      {/* ================= USER ================= */}
      <Link to="/account/profile" className="sidebar__user" aria-label="Hồ sơ của bạn">
        <Avatar user={user} size={40} />

        {!collapsed && (
          <div className="sidebar__user-info">
            <span className="sidebar__user-name">{user.name}</span>

            <span className="sidebar__user-level">Cấp độ: {curriculumLevel(user)}</span>
          </div>
        )}
      </Link>
    </aside>
  );
};

export default Sidebar;
