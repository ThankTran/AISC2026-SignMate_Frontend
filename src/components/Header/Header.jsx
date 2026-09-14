import { useState } from "react";

import HeaderSearch from "./HeaderSearch";
import HeaderNotification from "./HeaderNotification";
import HeaderSettings from "./HeaderSettings";

import "./Header.css";

const Header = ({ title, notifications = [] }) => {
  const [searchValue, setSearchValue] = useState("");

  return (
    <header className="header">
      <div className="header__left">
        {title && <h1 className="header__title">{title}</h1>}
      </div>

      <div className="header__right">
        <HeaderSearch value={searchValue} onChange={setSearchValue} />
        <HeaderNotification notifications={notifications} />
        <HeaderSettings />
      </div>
    </header>
  );
};

export default Header;