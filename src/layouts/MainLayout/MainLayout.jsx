import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { currentUser, headerNotifications } from "../../mockdata";

import "./MainLayout.css";

/* Màn hình chức năng dạng App/Dashboard: không hiển thị Footer chung */
const FULL_PAGE_ROUTES = [/^\/learning-path\/lesson/, /^\/practice-ai/];

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();

  const showFooter = !FULL_PAGE_ROUTES.some((re) => re.test(pathname));

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
          {showFooter && <Footer />}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;