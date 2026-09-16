import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { currentUser, headerNotifications } from "../../mockdata";

import "./MainLayout.css";

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

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
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
