import {useEffect,useMemo,useState,useCallback} from 'react';
import {ProgressContext} from '../hooks/useProgress';
import {useCurrentUser} from '../hooks/useCurrentUser';
import {initialProgress,deriveProgress,recordProgress} from '../utils/progress';
export function ProgressProvider({children,initialState}) {
 const user=useCurrentUser(),storageKey=`signmate-progress-v1:${user.uid||'guest'}`;
 const [resource,setResource]=useState({key:null,state:initialState||initialProgress(),status:'loading',error:null});
 const [revision,setRevision]=useState(0);
 useEffect(()=>{let active=true;Promise.resolve().then(()=>{try{const raw=initialState?null:localStorage.getItem(storageKey);const state=raw?JSON.parse(raw):initialState||initialProgress();if(state.version!==1||!Array.isArray(state.events)||!Array.isArray(state.completedLessons)||!state.userStats||!Array.isArray(state.userStats.activityHistory)||!state.lessonResults||!state.quizResults||!Array.isArray(state.notifications))throw Error('Dữ liệu tiến độ lưu trên thiết bị không hợp lệ.');if(active)setResource({key:storageKey,state,status:'ready',error:null});}catch(error){if(active)setResource({key:storageKey,state:initialProgress(),status:'error',error});}});return()=>{active=false;};},[storageKey,revision,initialState]);
 const mutate=useCallback(transform=>setResource(previous=>{const state=transform(previous.state);try{localStorage.setItem(storageKey,JSON.stringify(state));return {...previous,state,error:null};}catch(error){return {...previous,error};}}),[storageKey]);
 const data=useMemo(()=>deriveProgress(resource.state,user),[resource.state,user]);
 const retry=()=>setRevision(value=>value+1);
 return <ProgressContext.Provider value={{...data,status:resource.key===storageKey?resource.status:'loading',error:resource.error,retry,source:'mock',lessonResults:resource.state.lessonResults,quizResults:resource.state.quizResults,recordLesson:(id,result)=>mutate(state=>recordProgress(state,'lesson',id,result)),recordQuiz:(id,payload)=>mutate(state=>recordProgress(state,'quiz',id,payload)),readNotifications:ids=>mutate(state=>({...state,notifications:state.notifications.map(row=>ids.includes(row.id)?{...row,read:true}:row)}))}}>{children}</ProgressContext.Provider>;
}
