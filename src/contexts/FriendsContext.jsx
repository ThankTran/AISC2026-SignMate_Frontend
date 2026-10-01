import { FriendsContext } from '../hooks/useFriends';
import { useCallback,useEffect,useState } from 'react';
import {useAuth} from '../hooks/useAuth';
import {useCurrentUser} from '../hooks/useCurrentUser';
import {useApiResource} from '../hooks/useApiResource';
import {socialApi} from '../services/api';
import {adaptFriend} from '../api/friendsAdapter';
import { incomingScheduleRequestsData, incomingFriendRequestsData, scheduledSessionsData, friendsListData } from '../mockdata';
const loadFriends=async()=>({friends:friendsListData,incomingRequests:incomingFriendRequestsData,incomingScheduleRequests:incomingScheduleRequestsData,scheduledSessions:scheduledSessionsData});
function MockFriendsProvider({children,loader=loadFriends}) {
 const [status,setStatus]=useState('loading'),[error,setError]=useState(null),[revision,setRevision]=useState(0);
 const [friends,setFriends]=useState(friendsListData),[incomingRequests,setIncomingRequests]=useState(incomingFriendRequestsData),[incomingScheduleRequests,setIncomingScheduleRequests]=useState(incomingScheduleRequestsData),[scheduledSessions,setScheduledSessions]=useState(scheduledSessionsData),[sentRequests,setSentRequests]=useState([]);
 useEffect(()=>{let active=true;loader().then(data=>{if(active){setFriends(data.friends);setIncomingRequests(data.incomingRequests);setIncomingScheduleRequests(data.incomingScheduleRequests);setScheduledSessions(data.scheduledSessions);setStatus('ready');setError(null);}},failure=>{if(active){setStatus('error');setError(failure);}});return()=>{active=false;};},[loader,revision]);
 const addFriend = (id) => setSentRequests(current => current.includes(id) ? current : [...current,id]);
 return <FriendsContext.Provider value={{source:"mock",status,error,retry:()=>setRevision(value=>value+1),friends,setFriends,incomingRequests,setIncomingRequests,incomingScheduleRequests,setIncomingScheduleRequests,scheduledSessions,setScheduledSessions,sentRequests,addFriend}}>{children}</FriendsContext.Provider>;
}
const empty={friends:[],incomingRequests:[],outgoingRequests:[],incomingScheduleRequests:[],scheduledSessions:[]};
const unchanged=()=>{};
function ServerFriendsProvider({children}) {
 const user=useCurrentUser(),auth=useAuth(),uid=user?.uid,enabled=!!uid&&(!auth||auth.user?.emailVerified===true);
 const [revision,setRevision]=useState(0);
 const retry=useCallback(()=>setRevision(value=>value+1),[]);
 const load=useCallback(async()=>{
  if(!uid||!enabled)return empty;
  const [friends,incomingRequests,outgoingRequests]=await Promise.all([socialApi.friends(),socialApi.requests('incoming'),socialApi.requests('outgoing')]);
  return {...empty,friends:friends.map(adaptFriend),incomingRequests:incomingRequests.map(adaptFriend),outgoingRequests:outgoingRequests.map(adaptFriend)};
 },[uid,enabled]);
 const {data,error}=useApiResource(load,revision,{keepPrevious:true});
 useEffect(()=>{if(!enabled)return;const ping=()=>{if(document.visibilityState==='visible')socialApi.ping().then(retry).catch(()=>{});};ping();const timer=setInterval(ping,45000);document.addEventListener('visibilitychange',ping);return()=>{clearInterval(timer);document.removeEventListener('visibilitychange',ping);};},[enabled,uid,retry]);
 const addFriend=async id=>{const result=await socialApi.request(id);retry();return result;};
 const decideRequest=async(request,action)=>{
  await socialApi.decide(request.friendshipId,action);retry();
  return async()=>{if(action==='accept')await socialApi.remove(request.friendshipId);else await socialApi.request(request.id);retry();};
 };
 const value=data||empty;
 return <FriendsContext.Provider value={{...value,source:'server',status:!enabled?'idle':error?'error':data?'ready':'loading',error,retry,
  sentRequests:value.outgoingRequests.map(row=>row.id),addFriend,decideRequest,
  setFriends:unchanged,setIncomingRequests:unchanged,setIncomingScheduleRequests:unchanged,setScheduledSessions:unchanged}}>{children}</FriendsContext.Provider>;
}
export function FriendsProvider({children,loader}){
 return loader||import.meta.env.VITE_USE_MOCK==='true'?<MockFriendsProvider loader={loader}>{children}</MockFriendsProvider>:<ServerFriendsProvider>{children}</ServerFriendsProvider>;
}
