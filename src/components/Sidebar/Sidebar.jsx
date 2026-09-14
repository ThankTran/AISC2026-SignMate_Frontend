import { Menu } from "lucide-react";

import { sidebarItems } from "./sidebarData";
import SidebarItem from "./SidebarItem";

import "./Sidebar.css";

const Sidebar = ({
  collapsed = false,
  onToggle,
  user = {
    name: "Cassie",
    level: "Cơ bản",
    avatar: "C",
  },
}) => {
  return (
    <aside
      className={`sidebar ${
        collapsed ? "sidebar--collapsed" : ""
      }`}
    >
      {/* ================= HEADER ================= */}
      <div className="sidebar__header">
        {/* Logo A - trạng thái mở rộng */}
        {!collapsed && (
          <img
            src="/logo-signmate_text.png"
            alt="SignMate"
            className="sidebar__logo sidebar__logo--full"
          />
        )}

        {/* Logo B - trạng thái thu nhỏ */}
        {collapsed && (
          <img
            src="/logo-signmate.png"
            alt="SignMate"
            className="sidebar__logo sidebar__logo--collapsed"
          />
        )}

        {/* Hamburger Menu */}
        <button
          type="button"
          className="sidebar__toggle"
          onClick={onToggle}
          aria-label={
            collapsed
              ? "Mở sidebar"
              : "Thu gọn sidebar"
          }
        >
          <Menu size={19} strokeWidth={1.8} />
        </button>
      </div>

      {/* ================= NAVIGATION ================= */}
      <nav className="sidebar__nav">
        {sidebarItems.map((item, index) => {
          if (item.section) {
            return (
              <div
                className="sidebar__section"
                key={item.section}
              >
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