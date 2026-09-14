import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Home,
  BookOpen,
  Video,
  Users,
  UserRound,
  Trophy,
  Bot,
  BookMarked,
} from "lucide-react";

const ICONS = {
  home: Home,
  book: BookOpen,
  video: Video,
  users: Users,
  user: UserRound,
  trophy: Trophy,
  ai: Bot,
  learning: BookMarked,
};

const SidebarItem = ({ item, collapsed }) => {
  const location = useLocation();

  const hasChildren =
    Array.isArray(item.children) && item.children.length > 0;

  const hasActiveChild = hasChildren
    ? item.children.some((child) =>
        location.pathname.startsWith(child.path)
      )
    : false;

  const [expanded, setExpanded] = useState(
    item.defaultOpen || hasActiveChild
  );

  useEffect(() => {
    if (hasActiveChild) {
      setExpanded(true);
    }
  }, [hasActiveChild]);

  const Icon = ICONS[item.icon] || BookOpen;

  // =====================================================
  // ITEM CÓ SUBMENU
  // =====================================================

  if (hasChildren) {
    return (
      <div
        className={`sidebar-item-group ${
          expanded ? "sidebar-item-group--expanded" : ""
        }`}
      >
        <button
          type="button"
          className={`sidebar-item sidebar-item--parent ${
            hasActiveChild ? "sidebar-item--active-parent" : ""
          }`}
          onClick={() => setExpanded((prev) => !prev)}
          title={collapsed ? item.label : undefined}
          aria-expanded={expanded}
          aria-controls={`submenu-${item.label.replace(/\s+/g, "-")}`}
        >
          <span className="sidebar-item__icon">
            <Icon size={16} strokeWidth={1.8} />
          </span>

          {!collapsed && (
            <>
              <span className="sidebar-item__label">
                {item.label}
              </span>

              <ChevronDown
                className={`sidebar-item__chevron ${
                  expanded ? "sidebar-item__chevron--open" : ""
                }`}
                size={13}
                strokeWidth={1.8}
              />
            </>
          )}
        </button>

        {!collapsed && expanded && (
          <div className="sidebar-submenu">
            {item.children.map((child) => (
              <NavLink
                key={child.label}
                to={child.path}
                className={({ isActive }) =>
                  `sidebar-submenu__item ${
                    isActive
                      ? "sidebar-submenu__item--active"
                      : ""
                  }`
                }
              >
                <span className="sidebar-submenu__dot" />

                <span className="sidebar-submenu__label">
                  {child.label}
                </span>
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  // =====================================================
  // ITEM BÌNH THƯỜNG
  // =====================================================

  return (
    <NavLink
      to={item.path}
      end={item.end}
      className={({ isActive }) =>
        `sidebar-item ${
          isActive ? "sidebar-item--active" : ""
        }`
      }
      title={collapsed ? item.label : undefined}
    >
      <span className="sidebar-item__icon">
        <Icon size={16} strokeWidth={1.8} />
      </span>

      {!collapsed && (
        <span className="sidebar-item__label">
          {item.label}
        </span>
      )}
    </NavLink>
  );
};

export default SidebarItem;