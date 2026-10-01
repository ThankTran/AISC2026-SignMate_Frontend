import {useProgress} from "../../hooks/useProgress";
import { useEffect, useId, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {useToast} from '../../hooks/useToast';
const destination = item => item.path || (item.type === 'video' || /video/i.test(item.title) ? '/friends/video-call-invites' : item.type==='ai' || /AI/.test(item.title) ? '/practice-ai' : '/ranking');
export default function HeaderNotification({ notifications=[] }) {
 const {notifications:sharedNotifications,readNotifications}=useProgress();notifications=sharedNotifications;
 const [open,setOpen]=useState(false);const wrapper=useRef(null),trigger=useRef(null),id=useId(),navigate=useNavigate();
 const toast=useToast();
 const markRead=async ids=>{try{await readNotifications(ids);}catch{toast({type:'error',message:'Chưa thể đánh dấu thông báo đã đọc. Vui lòng thử lại.'});}};
 const close=()=>{setOpen(false);trigger.current?.focus();};
 useEffect(()=>{if(!open)return;const outside=e=>{if(!wrapper.current?.contains(e.target)){setOpen(false);trigger.current?.focus();}};document.addEventListener('pointerdown',outside);return()=>document.removeEventListener('pointerdown',outside);},[open]);
 const unread=notifications.filter(n=>!n.read).length;
 return <div className="header-notification" ref={wrapper} onKeyDown={e=>{if(e.key==='Escape'){e.stopPropagation();close();}}}>
 <button ref={trigger} className="header-icon-btn" onClick={()=>setOpen(v=>!v)} aria-label={`Thông báo, ${unread} chưa đọc`} aria-haspopup="dialog" aria-expanded={open} aria-controls={id}><Bell size={20}/>{unread>0&&<span className="header-notification__badge">{unread}</span>}</button>
 {open&&<div id={id} role="dialog" aria-label="Thông báo" className="header-notification__dropdown"><div className="header-notification__dropdown-title">Thông báo</div><button className="notification-read-all" onClick={()=>markRead(notifications.filter(n=>!n.read).map(n=>n.id))}>Đánh dấu tất cả đã đọc</button>
 {!notifications.length?<p>Không có thông báo mới</p>:<ul className="header-notification__list">{notifications.map(item=><li key={item.id}><button className={`header-notification__item ${!item.read?'header-notification__item--unread':''}`} onClick={()=>{if(!item.read)markRead([item.id]);close();navigate(destination(item));}}><span className="header-notification__item-title">{item.title}</span><span className="header-notification__item-time">{item.time}</span></button></li>)}</ul>}</div>}
 </div>;
}
