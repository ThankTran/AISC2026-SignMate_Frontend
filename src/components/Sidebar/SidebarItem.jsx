import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Home, BookOpen, Video, Users, Trophy, Bot, BookMarked } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useFriends } from "../../hooks/useFriends";
const ICONS={home:Home,book:BookOpen,video:Video,users:Users,trophy:Trophy,ai:Bot,learning:BookMarked};
export default function SidebarItem({item,collapsed}) {
 const location=useLocation(),id=`submenu-${useId().replace(/:/g,'')}`,trigger=useRef(null),panel=useRef(null),timer=useRef(null);
 const hasChildren=!!item.children?.length,active=item.children?.some(c=>location.pathname.startsWith(c.path));
 const [expanded,setExpanded]=useState(item.defaultOpen||active),[flyout,setFlyout]=useState(null);
 const {incomingRequests,incomingScheduleRequests}=useFriends();
 const count=path=>path==='/friends/friend-requests'?incomingRequests.length:path==='/friends/video-call-invites'?incomingScheduleRequests.length:0;
 const open=collapsed?flyout?.key===location.key:expanded;
 const close=()=>{setFlyout(null);trigger.current?.focus();};
 useEffect(()=>()=>clearTimeout(timer.current),[]);
 useEffect(()=>{if(!collapsed||!open)return;const outside=e=>{if(!trigger.current?.contains(e.target)&&!panel.current?.contains(e.target))setFlyout(null);};document.addEventListener('pointerdown',outside);return()=>document.removeEventListener('pointerdown',outside);},[collapsed,open]);
 const show=(pinned=false)=>{clearTimeout(timer.current);const rect=trigger.current.getBoundingClientRect();setFlyout(previous=>({pinned:pinned||previous?.pinned,key:location.key,top:Math.min(rect.top,window.innerHeight-240),left:rect.right+8}));};
 const leave=()=>{timer.current=setTimeout(()=>setFlyout(value=>value?.pinned?value:null),180);};
 const Icon=ICONS[item.icon]||BookOpen;
 const submenu=<div ref={panel} id={id} className={collapsed?'sidebar-flyout':'sidebar-submenu'} style={collapsed?{top:flyout?.top,left:flyout?.left}:undefined} onMouseEnter={()=>clearTimeout(timer.current)} onMouseLeave={collapsed?leave:undefined} onKeyDown={e=>{if(e.key==='Escape'){e.stopPropagation();collapsed?close():setExpanded(false);trigger.current?.focus();}}} onBlur={e=>{if(collapsed&&!e.currentTarget.contains(e.relatedTarget)&&e.relatedTarget!==trigger.current)setFlyout(null);}}>
 {collapsed&&<strong>{item.label}</strong>}{item.children?.map(child=><NavLink key={child.path} to={child.path} className={({isActive})=>`sidebar-submenu__item ${isActive?'sidebar-submenu__item--active':''}`} onClick={()=>setFlyout(null)}><span>{child.label}</span>{count(child.path)>0&&<span className="sidebar-badge">{count(child.path)}</span>}</NavLink>)}
 </div>;
 if(!hasChildren)return <NavLink to={item.path} end={item.end} title={collapsed?item.label:undefined} aria-label={collapsed?item.label:undefined} className={({isActive})=>`sidebar-item ${isActive?'sidebar-item--active':''}`}><Icon size={20}/>{!collapsed&&<span className="sidebar-item__label">{item.label}</span>}</NavLink>;
 return <div className="sidebar-item-group" onMouseEnter={collapsed?()=>show():undefined} onMouseLeave={collapsed?leave:undefined}>
 <button ref={trigger} className={`sidebar-item sidebar-item--parent ${open?'sidebar-item--expanded-parent':''}`} aria-label={item.label} aria-expanded={!!open} aria-controls={open?id:undefined} aria-haspopup={collapsed?'true':undefined} onClick={()=>collapsed?open&&flyout?.pinned?close():show(true):setExpanded(v=>!v)} onKeyDown={e=>{if(e.key==='Escape'){close();setExpanded(false);}if(e.key==='ArrowRight'||e.key==='ArrowDown'){e.preventDefault();collapsed?show():setExpanded(true);requestAnimationFrame(()=>panel.current?.querySelector('a')?.focus());}}}><Icon size={20}/>{!collapsed&&<><span className="sidebar-item__label">{item.label}</span><ChevronDown className="sidebar-item__chevron" size={16}/></>}</button>
 {open&&(collapsed?createPortal(submenu,document.body):submenu)}</div>;
}
