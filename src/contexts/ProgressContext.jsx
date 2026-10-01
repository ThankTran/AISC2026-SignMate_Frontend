import {useMemo,useState,useCallback} from 'react';
import {ProgressContext} from '../hooks/useProgress';
import {useCurrentUser} from '../hooks/useCurrentUser';
import {useAuth} from '../hooks/useAuth';
import {useApiResource} from '../hooks/useApiResource';
import {accountApi} from '../services/api';
import {useNotificationResource} from '../hooks/useNotificationResource';
import {adaptProgress,adaptLeaderboard} from '../api/progressAdapter';
import {initialProgress,deriveProgress,recordProgress} from '../utils/progress';

const emptyProgress = adaptProgress();
function ServerProgressProvider({children}) {
 const user=useCurrentUser(),uid=user?.uid;
 const auth=useAuth(),enabled=!!uid&&(!auth||auth.user?.emailVerified===true);
 const notifications=useNotificationResource(uid,enabled);
 const [revision,setRevision]=useState(0);
 const load=useCallback(async()=>{
  if(!uid||!enabled)return emptyProgress;
  const [dashboard,stats,leaderboard,levelLeaderboard]=await Promise.all([
   accountApi.dashboard(),accountApi.stats(),accountApi.leaderboard('all'),accountApi.leaderboard('level')]);
  return {...adaptProgress({dashboard,stats,leaderboard}),levelLeaderboard:adaptLeaderboard(levelLeaderboard)};
 },[uid,enabled]);
 const {data,error}=useApiResource(load,`${revision}:${auth?.authRevision||0}`);
 const retry=useCallback(()=>setRevision(value=>value+1),[]);
 // Results stay on the calling page/router state. Only the server owns progress.
 return <ProgressContext.Provider value={{...(data||emptyProgress),...notifications,status:!enabled?'idle':error?'error':data?'ready':'loading',error,retry,source:'server',lessonResults:{},quizResults:{},recordLesson:retry,recordQuiz:retry}}>{children}</ProgressContext.Provider>;
}
function MockProgressProvider({children,initialState}) {
 const user=useCurrentUser();
 const [state,setState]=useState(()=>initialState||initialProgress());
 const data=useMemo(()=>deriveProgress(state,user||{}),[state,user]);
 return <ProgressContext.Provider value={{...data,status:'ready',error:null,retry:()=>{},source:'mock',lessonResults:state.lessonResults,quizResults:state.quizResults,
  recordLesson:(id,result)=>setState(previous=>recordProgress(previous,'lesson',id,result)),
  recordQuiz:(id,payload)=>setState(previous=>recordProgress(previous,'quiz',id,payload)),
  notificationStatus:'ready',unreadCount:data.notifications.filter(row=>!row.read).length,
  readAllNotifications:()=>setState(previous=>({...previous,notifications:previous.notifications.map(row=>({...row,read:true}))})),
  readNotifications:ids=>setState(previous=>({...previous,notifications:previous.notifications.map(row=>ids.includes(row.id)?{...row,read:true}:row)}))}}>{children}</ProgressContext.Provider>;
}
export function ProgressProvider({children,initialState}) {
 // initialState is an explicit fixture injection; runtime offline mode uses the env flag.
 return import.meta.env.VITE_USE_MOCK==='true'||initialState
  ? <MockProgressProvider initialState={initialState}>{children}</MockProgressProvider>
  : <ServerProgressProvider>{children}</ServerProgressProvider>;
}
