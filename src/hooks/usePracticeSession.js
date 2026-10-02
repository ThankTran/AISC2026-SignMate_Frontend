import {useCallback,useEffect,useRef,useState} from 'react';
import {practiceApi} from '../services/api';
export function usePracticeSession({api=practiceApi,mock=import.meta.env.VITE_USE_MOCK==='true'}={}) {
 const [state,setState]=useState({status:'idle',session:null,error:null});
 const current=useRef(null),key=useRef(null),pending=useRef(null),mounted=useRef(true);
 const publish=useCallback(next=>{if(mounted.current)setState(next);},[]);
 const finish=useCallback(async()=>{
  while(pending.current)await pending.current;
  if(!current.current)return null;
  const session=current.current;
  publish({status:'loading',session,error:null});
  pending.current=(async()=>{
   try {
    const result=await (mock?Promise.resolve({...session,xp:0,accuracy:null,aiStatus:'demo',durationSeconds:0}):api.finish(session.id));
    current.current=null;key.current=null;publish({status:'ready',session:result,error:null});return result;
   } catch(error){publish({status:'error',session,error});return null;}
   finally{pending.current=null;}
  })();
  return pending.current;
 },[api,mock,publish]);
 const start=useCallback(async sign=>{
  if(pending.current)return null;
  if(current.current)return current.current;
  key.current??=crypto.randomUUID();publish({status:'loading',session:null,error:null});
  pending.current=(async()=>{
   try {
    const result=await (mock?Promise.resolve({id:key.current,aiStatus:'demo'}):api.start({sign,userSessionId:key.current}));
    if(!mounted.current){if(!mock)await api.finish(result.id);return null;}
    current.current=result;publish({status:'active',session:result,error:null});return result;
   } catch(error){publish({status:'error',session:null,error});return null;}
   finally{pending.current=null;}
  })();
  return pending.current;
 },[api,mock,publish]);
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;const session=current.current;if(session&&!pending.current&&!mock)void api.finish(session.id).catch(()=>{});};},[api,mock]);
 return {...state,start,finish,hasOpenSession:()=>!!current.current};
}
