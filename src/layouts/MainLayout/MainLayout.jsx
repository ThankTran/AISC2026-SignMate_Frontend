import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { currentUser, headerNotifications } from "../../mockdata";

import "./MainLayout.css";

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const bodyEl = document.querySelector(".main-layout__body");
    if (bodyEl) bodyEl.scrollTop = 0;
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div
      className={`main-layout ${
        collapsed ? "main-layout--collapsed" : ""
      }`}
    >
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
        user={currentUser}
      />

      <div className="main-layout__content">
        <Header notifications={headerNotifications} />

        <main className="main-layout__body">
          <div className="main-layout__page">
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;