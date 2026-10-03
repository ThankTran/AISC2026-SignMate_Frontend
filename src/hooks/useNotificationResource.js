import {useCallback,useEffect,useMemo,useState} from 'react';
import {useApiResource} from './useApiResource';
import {socialApi} from '../services/api';
import {adaptNotifications} from '../api/notificationAdapter';
export function useNotificationResource(uid,enabled){
 const [revision,setRevision]=useState(0),[clock,setClock]=useState(Date.now);
 const retry=useCallback(()=>setRevision(value=>value+1),[]);
 const load=useCallback(async()=>{if(!uid||!enabled)return {rows:[],count:0};const [rows,{count}]=await Promise.all([socialApi.notifications(),socialApi.unreadCount()]);return {rows,count};},[uid,enabled]);
 const {data,error}=useApiResource(load,revision,{keepPrevious:true});
 useEffect(()=>{if(!enabled)return;const refresh=()=>{if(document.visibilityState==='visible'){setClock(Date.now());retry();}};const timer=setInterval(refresh,30000);document.addEventListener('visibilitychange',refresh);return()=>{clearInterval(timer);document.removeEventListener('visibilitychange',refresh);};},[enabled,retry]);
 const notifications=useMemo(()=>adaptNotifications(data?.rows||[],clock),[data,clock]);
 const readNotifications=useCallback(async ids=>{await Promise.all(ids.map(id=>socialApi.read(id)));retry();},[retry]);
 const readAllNotifications=useCallback(async()=>{await socialApi.readAll();retry();},[retry]);
 return useMemo(()=>({notifications,unreadCount:data?.count??0,notificationStatus:!enabled?'idle':error?'error':data?'ready':'loading',notificationError:error,retryNotifications:retry,readNotifications,readAllNotifications}),[notifications,data,enabled,error,retry,readNotifications,readAllNotifications]);
}
