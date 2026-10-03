import { Menu } from "lucide-react";
import HeaderNotification from "./HeaderNotification";
import HeaderSettings from "./HeaderSettings";
import "./Header.css";
export default function Header({ notifications=[], mobile, onOpenMenu }) { return <header className="header"><div className="header__left">{mobile&&<button className="header-icon-btn" onClick={onOpenMenu} aria-label="Mở menu điều hướng"><Menu size={24}/></button>}</div><div className="header__right"><HeaderNotification notifications={notifications}/><HeaderSettings/></div></header>; }
