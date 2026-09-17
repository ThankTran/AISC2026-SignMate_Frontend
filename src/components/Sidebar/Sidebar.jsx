import { PanelLeftClose, PanelLeft } from "lucide-react";

import { sidebarItems } from "../../mockdata";
import SidebarItem from "./SidebarItem";

import "./Sidebar.css";

const Sidebar = ({
  collapsed = false,
  onToggle,
  user,
}) => {
  return (
    <aside
      className={`sidebar ${
        collapsed ? "sidebar--collapsed" : ""
      }`}
    >
      {/* ================= HEADER ================= */}
      <div className="sidebar__header">
        <div className="sidebar__logo-wrapper">
          {/* Logo - dùng chung 1 ảnh cho cả 2 trạng thái */}
          <img
            src="/logo-signmate.png"
            alt="SignMate"
            className="sidebar__logo"
          />

          {/* Nút toggle - chỉ hiện khi hover vào vùng logo */}
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
        </div>
      </div>

      {/* ================= NAVIGATION ================= */}
      <nav className="sidebar__nav">
        {sidebarItems.map((item, index) => {
          if (item.section) {
            return (
              <div className="sidebar__section" key={item.section}>
                <div className="sidebar__section-title">
                  {item.section}
                </div>

                <div className="sidebar__section-items">
                  {item.children?.map((child) => (
                    <SidebarItem
                      key={child.label}
                      item={child}
                      collapsed={collapsed}
                    />
                  ))}
                </div>
              </div>
            );
          }

          return (
            <SidebarItem
              key={item.label || index}
              item={item}
              collapsed={collapsed}
            />
          );
        })}
      </nav>

      {/* ================= USER ================= */}
      <div className="sidebar__user">
        <div className="sidebar__user-avatar">
          {user.avatar}
        </div>

        {!collapsed && (
          <div className="sidebar__user-info">
            <span className="sidebar__user-name">
              {user.name}
            </span>

            <span className="sidebar__user-level">
              Cấp độ: {user.level}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
