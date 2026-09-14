import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../../components/Sidebar/Sidebar";

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
      />

      <main className="main-layout__content">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;