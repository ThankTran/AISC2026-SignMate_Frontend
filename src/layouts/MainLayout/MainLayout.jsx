import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Modal from "../../components/ui/Modal";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useProgress } from "../../hooks/useProgress";
import "./MainLayout.css";
export default function MainLayout() {
  const { notifications } = useProgress();
  const [collapsed, setCollapsed] = useState(false),
    [drawer, setDrawer] = useState(null);
  const location = useLocation(),
    mobile = useMediaQuery("(max-width:768px)"),
    user = useCurrentUser();
  const drawerOpen = mobile && drawer === location.key;
  const focus = /^\/learning-path\/(lesson|quiz)\//.test(location.pathname);

  return (
    <div className={`main-layout ${collapsed && !mobile ? "main-layout--collapsed" : ""}`}>
      <a className="skip-link" href="#main-content">
        Bỏ qua tới nội dung chính
      </a>
      {!mobile && (
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} user={user} />
      )}
      <Modal
        open={drawerOpen}
        onClose={() => setDrawer(null)}
        labelledBy="mobile-nav-title"
        className="mobile-nav-drawer"
      >
        <h2 id="mobile-nav-title" className="sr-only">
          Điều hướng
        </h2>
        <button className="drawer-close" onClick={() => setDrawer(null)} aria-label="Đóng menu">
          ×
        </button>
        <Sidebar collapsed={false} user={user} />
      </Modal>
      <div className="main-layout__content">
        <Header
          notifications={notifications}
          onOpenMenu={() => setDrawer(location.key)}
          mobile={mobile}
        />
        <main id="main-content" tabIndex={-1} className="main-layout__body">
          <div className="main-layout__page">
            <Outlet />
          </div>
          {!focus && <Footer />}
        </main>
      </div>
    </div>
  );
}
