import {useLocation} from 'react-router-dom';
import {canLoadAccount,loadProgress,loadRankings,needsRankings} from '../services/progressLoader';
import {useMemo,useState,useCallback} from 'react';
import {ProgressContext} from '../hooks/useProgress';
import {useCurrentUser} from '../hooks/useCurrentUser';
import {useAuth} from '../hooks/useAuth';
import {useApiResource} from '../hooks/useApiResource';
import {accountApi} from '../services/api';
import {useNotificationResource} from '../hooks/useNotificationResource';
import {adaptProgress} from '../api/progressAdapter';
import {initialProgress,deriveProgress,recordProgress} from '../utils/progress';

const emptyProgress = adaptProgress();
const noop = () => {};
function ServerProgressProvider({children}) {
 const user=useCurrentUser(),uid=user?.uid;
 const auth=useAuth(),enabled=canLoadAccount(uid,auth);
 const {pathname}=useLocation();
 const rankingEnabled=enabled&&needsRankings(pathname);
 const notifications=useNotificationResource(uid,enabled);
 const [revision,setRevision]=useState(0);
 const load=useCallback(async()=>{
  if(!uid||!enabled)return emptyProgress;
  return loadProgress(accountApi);
 },[uid,enabled]);
 const refreshKey=`${revision}:${auth?.authRevision||0}`;
 const {data,error}=useApiResource(load,refreshKey,{keepPrevious:true});
 const loadRanking=useCallback(()=>uid&&rankingEnabled?loadRankings(accountApi):Promise.resolve(null),[uid,rankingEnabled]);
 const {data:rankings,error:rankingError}=useApiResource(loadRanking,refreshKey,{keepPrevious:true});
 const retry=useCallback(()=>setRevision(value=>value+1),[]);
 // Results stay on the calling page/router state. Only the server owns progress.
 const value=useMemo(()=>({...(data||emptyProgress),...rankings,...notifications,rankingStatus:rankingError?'error':rankings?'ready':'loading',rankingError,status:!enabled?'idle':error?'error':data?'ready':'loading',error,retry,source:'server',lessonResults:{},quizResults:{},recordLesson:retry,recordQuiz:retry}),[data,rankings,rankingError,notifications,enabled,error,retry]);
 return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}
function MockProgressProvider({children,initialState}) {
 const user=useCurrentUser();
 const [state,setState]=useState(()=>initialState||initialProgress());
 const data=useMemo(()=>deriveProgress(state,user||{}),[state,user]);
 const recordLesson=useCallback((id,result)=>setState(previous=>recordProgress(previous,'lesson',id,result)),[]);
 const recordQuiz=useCallback((id,payload)=>setState(previous=>recordProgress(previous,'quiz',id,payload)),[]);
 const readAllNotifications=useCallback(()=>setState(previous=>({...previous,notifications:previous.notifications.map(row=>({...row,read:true}))})),[]);
 const readNotifications=useCallback(ids=>setState(previous=>({...previous,notifications:previous.notifications.map(row=>ids.includes(row.id)?{...row,read:true}:row)})),[]);
 const value=useMemo(()=>({...data,status:'ready',error:null,retry:noop,source:'mock',lessonResults:state.lessonResults,quizResults:state.quizResults,
  recordLesson,recordQuiz,
  notificationStatus:'ready',unreadCount:data.notifications.filter(row=>!row.read).length,
  readAllNotifications,readNotifications}),[data,state.lessonResults,state.quizResults,recordLesson,recordQuiz,readAllNotifications,readNotifications]);
 return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}
export function ProgressProvider({children,initialState}) {
 // initialState is an explicit fixture injection; runtime offline mode uses the env flag.
 return import.meta.env.VITE_USE_MOCK==='true'||initialState
  ? <MockProgressProvider initialState={initialState}>{children}</MockProgressProvider>
  : <ServerProgressProvider>{children}</ServerProgressProvider>;
}
