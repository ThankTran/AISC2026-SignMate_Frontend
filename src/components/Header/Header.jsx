import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import HeaderNotification from "./HeaderNotification";
import HeaderSettings from "./HeaderSettings";
import "./Header.css";
const titles={'/dashboard':'Trang chủ','/learning-path':'Lộ trình học','/practice-ai':'Luyện tập với AI','/ranking':'Bảng xếp hạng','/video':'Gọi video','/friends/list':'Bạn bè','/friends/friend-requests':'Lời mời kết bạn','/friends/video-call-invites':'Lời mời hẹn video call','/account/profile':'Hồ sơ','/account/stats':'Thống kê'};
export default function Header({ notifications=[], mobile, onOpenMenu }) { const {pathname}=useLocation();const title=titles[pathname] || (pathname.includes('/lesson/')?'Bài học':pathname.endsWith('/result')?'Kết quả kiểm tra':pathname.includes('/quiz/')?'Bài kiểm tra':'SignMate');return <header className="header"><div className="header__left">{mobile&&<button className="header-icon-btn" onClick={onOpenMenu} aria-label="Mở menu điều hướng"><Menu size={24}/></button>}<span className="header__title text-h3">{title}</span></div><div className="header__right"><HeaderNotification notifications={notifications}/><HeaderSettings/></div></header>; }
