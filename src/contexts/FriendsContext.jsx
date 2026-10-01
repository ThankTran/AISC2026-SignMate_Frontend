import { FriendsContext } from '../hooks/useFriends';
import { useEffect,useState } from 'react';
import { incomingScheduleRequestsData, incomingFriendRequestsData, scheduledSessionsData, friendsListData } from '../mockdata';
const loadFriends=async()=>({friends:friendsListData,incomingRequests:incomingFriendRequestsData,incomingScheduleRequests:incomingScheduleRequestsData,scheduledSessions:scheduledSessionsData});
export function FriendsProvider({children,loader=loadFriends}) {
 const [status,setStatus]=useState('loading'),[error,setError]=useState(null),[revision,setRevision]=useState(0);
 const [friends,setFriends]=useState(friendsListData),[incomingRequests,setIncomingRequests]=useState(incomingFriendRequestsData),[incomingScheduleRequests,setIncomingScheduleRequests]=useState(incomingScheduleRequestsData),[scheduledSessions,setScheduledSessions]=useState(scheduledSessionsData),[sentRequests,setSentRequests]=useState([]);
 useEffect(()=>{let active=true;loader().then(data=>{if(active){setFriends(data.friends);setIncomingRequests(data.incomingRequests);setIncomingScheduleRequests(data.incomingScheduleRequests);setScheduledSessions(data.scheduledSessions);setStatus('ready');setError(null);}},failure=>{if(active){setStatus('error');setError(failure);}});return()=>{active=false;};},[loader,revision]);
 const addFriend = (id) => setSentRequests(current => current.includes(id) ? current : [...current,id]);
 return <FriendsContext.Provider value={{status,error,retry:()=>setRevision(value=>value+1),friends,setFriends,incomingRequests,setIncomingRequests,incomingScheduleRequests,setIncomingScheduleRequests,scheduledSessions,setScheduledSessions,sentRequests,addFriend}}>{children}</FriendsContext.Provider>;
}
